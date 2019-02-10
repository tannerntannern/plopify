module.exports = {
  prompts: [{
    name: 'project_name',
    message: 'Project name?',
    validate: (input) => /^[a-z0-9\-]+$/.test(input) ? true : 'Must be a dash-case-name'
  }],
  updatePolicies: []
};