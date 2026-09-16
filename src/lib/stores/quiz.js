import { writable, get } from 'svelte/store';

/**
 * Weight values: 1 = low, 2 = medium (default), 3 = high
 * @typedef {{ answers: Record<string, string>, weights: Record<string, number> }} QuizState
 */

function createQuizStore() {
  /** @type {import('svelte/store').Writable<Record<string, string>>} */
  const answers = writable({});

  /** @type {import('svelte/store').Writable<Record<string, number>>} */
  const weights = writable({});

  return {
    answers,
    weights,

    /** @param {string} criterionId @param {string} value */
    setAnswer(criterionId, value) {
      answers.update((a) => ({ ...a, [criterionId]: value }));
    },

    /** @param {string} criterionId @param {number} value 1|2|3 */
    setWeight(criterionId, value) {
      weights.update((w) => ({ ...w, [criterionId]: value }));
    },

    reset() {
      answers.set({});
      weights.set({});
    },

    /** @returns {QuizState} */
    getState() {
      return { answers: get(answers), weights: get(weights) };
    },

    /** @param {QuizState} state */
    loadState(state) {
      if (state?.answers) answers.set(state.answers);
      if (state?.weights) weights.set(state.weights);
    }
  };
}

export const quiz = createQuizStore();
