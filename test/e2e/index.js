describe('E2E: Home page', function() {

  it('should load the home page', function() {
    browser().navigateTo('/#/login');
    expect(browser().location().path()).toBe('/#/login');
  })

})