module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
			2,
			'always',
			[
        'release',
				'build',
				'chore',
				'ci',
				'docs',
				'feat',
				'fix',
				'perf',
				'refactor',
				'revert',
				'test'
			],
		],
  }
};
