import { Utility } from './Utility'

describe('Utility.ts', () => {
  describe('getStoragePathFromUrlPath', () => {
    const testCases = [
      { path: '/file.txt', expected: '0c/a6/9a/cb643ae682dd700b7c190b2564.file' },
      { path: '/path/to/image.png', expected: '2c/e7/97/bacf9cda6759eda5f8b3d641dd.file' },
      { path: '/another/test/file.pdf', expected: 'c2/65/6c/ab9c05092fb699e970b3098430.file' },
    ]

    testCases.forEach(({ path, expected }) => it(`should return ${expected} for path ${path}`, () => {
      const utility = new Utility()
      const storagePath = utility.getStoragePathFromUrlPath(path)
      expect(storagePath).toBe(expected)
    }))
  })

  describe('hashString', () => {
    const testCases = [
      { input: 'test', expected: '098f6bcd4621d373cade4e832627b4f6' },
      { input: 'another test', expected: '5e8862cd73694287ff341e75c95e3c6a' },
      { input: '1234567890', expected: 'e807f1fcf82d132f9bb018ca6738a19f' },
    ]

    testCases.forEach(({ input, expected }) => it(`should return ${expected} for input "${input}"`, () => {
      const utility = new Utility()
      const hash = utility.hashString(input)
      expect(hash).toBe(expected)
    }))
  })
})
