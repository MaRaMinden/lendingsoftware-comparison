/**
 * Core scoring engine – Weighted Factor Model + exclusion criteria.
 *
 * Scores are normalised to [0, 1].  Max raw points per criterion = 3.
 */

/**
 * @typedef {Object} Criterion
 * @property {string} id
 * @property {'exclusion'|'weighted'} type
 * @property {Array<{value:string, exclusion_rule?: {property:string, required_value?:boolean, includes?:string}}>} options
 */

/**
 * @typedef {Object} Solution
 * @property {string} id
 * @property {{ open_source: boolean, hosting: string[] }} properties
 * @property {Record<string, Record<string, number>>} criteria_scores
 */

/**
 * @typedef {Object} ScoredSolution
 * @property {Solution} solution
 * @property {number} score       Normalised 0–1
 * @property {boolean} excluded
 * @property {string|null} excludedBy  Criterion id that triggered exclusion
 * @property {Array<{criterionId:string, answer:string|null, rawScore:number, weight:number, contribution:number}>} breakdown
 */

const MAX_SCORE_PER_CRITERION = 3;

/**
 * Check whether a solution is excluded by an exclusion criterion + answer.
 * @param {Solution} solution
 * @param {Criterion} criterion
 * @param {string} answer
 * @returns {boolean} true if the solution should be excluded
 */
function isExcluded(solution, criterion, answer) {
  const option = criterion.options.find((o) => o.value === answer);
  if (!option?.exclusion_rule) return false;

  const rule = option.exclusion_rule;
  const prop = solution.properties[rule.property];

  if ('required_value' in rule) {
    // e.g. open_source must be true
    return prop !== rule.required_value;
  }
  if ('includes' in rule) {
    // e.g. hosting must include 'self_hosted'
    return !Array.isArray(prop) || !prop.includes(rule.includes);
  }
  return false;
}

/**
 * Score and rank solutions.
 *
 * @param {Solution[]} solutions
 * @param {Criterion[]} criteria
 * @param {Record<string,string>} answers   criterionId → chosen option value
 * @param {Record<string,number>} weights   criterionId → 1|2|3 (default 2)
 * @returns {ScoredSolution[]}  All solutions, excluded ones at the end
 */
export function scoreAndRank(solutions, criteria, answers, weights) {
  const exclusionCriteria = criteria.filter((c) => c.type === 'exclusion');
  const weightedCriteria  = criteria.filter((c) => c.type === 'weighted');

  const results = solutions.map((solution) => {
    // --- Exclusion pass ---
    let excluded = false;
    let excludedBy = null;

    for (const criterion of exclusionCriteria) {
      const answer = answers[criterion.id];
      if (!answer) continue;
      if (isExcluded(solution, criterion, answer)) {
        excluded = true;
        excludedBy = criterion.id;
        break;
      }
    }

    // --- Weighted scoring pass ---
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const breakdown = [];

    for (const criterion of weightedCriteria) {
      const answer = answers[criterion.id];
      const weight = weights[criterion.id] ?? 2; // default: important
      const rawScore = answer
        ? (solution.criteria_scores[criterion.id]?.[answer] ?? 1)
        : 1; // unanswered: neutral score

      const contribution = rawScore * weight;
      totalWeightedScore += contribution;
      totalWeight += weight * MAX_SCORE_PER_CRITERION;

      breakdown.push({ criterionId: criterion.id, answer, rawScore, weight, contribution });
    }

    const normalisedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return { solution, score: normalisedScore, excluded, excludedBy, breakdown };
  });

  // Sort: non-excluded by score desc, then excluded alphabetically
  return results.sort((a, b) => {
    if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
    return b.score - a.score;
  });
}
