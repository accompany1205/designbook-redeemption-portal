module.exports = {
    apps: [
      {
        name: 'my-react-app',
        script: 'serve -s build',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  