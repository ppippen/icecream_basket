// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* 每次测试的超时时间 */
  timeout: 30 * 1000,
  /* 测试运行器的超时时间 */
  expect: {
    timeout: 5000
  },
  /* 测试报告 */
  reporter: 'html',
  /* 配置项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
        screenshot: 'on',
        video: 'on',
        trace: 'on'
      },
    },
  ],
  /* 本地开发服务器配置 */
  webServer: {
    command: 'npx http-server',
    reuseExistingServer: !process.env.CI,
  },
}); 