import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      // Set BASE_PATH env var when deploying to a GitHub Pages subpath,
      // e.g. BASE_PATH=/leih-finder for https://user.github.io/leih-finder/
      base: process.env.BASE_PATH ?? ''
    }
  }
};
