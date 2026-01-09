export default {
  paths: ['src/features/**/*.feature'],

  import: [
    'src/support/hooks.ts',
    'src/support/world.ts',
    'src/features/**/*.ts'
  ],

  format: ['progress'],
  publishQuiet: true,

  timeout: 180000
};