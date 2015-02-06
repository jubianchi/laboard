Feature: Login

  As a Gitlab user
  I should be able to login to Laboard
  In order to use Laboard

  Background:
    Given user "test" has token "foobar"
    Given project "bar" exists in namespace "foo"

  Scenario: Display the token-based authentication form
    When I go to laboard
    Then I should see a "Token" field
    And I should see a "Login" button

  Scenario: Display the password-based authentication form
    When I go to laboard
    And I click on "Password"
    Then I should see a "Username" field
    And I should see a "Password" field
    And I should see a "Login" button

  Scenario: Authentication failure
    When I go to laboard
    And I click on "Login"
    Then I should see "Authentication failed, please check your token" in ".alert.alert-danger"

  Scenario: Authentication success
    When I go to laboard
    And I type "foobar" in "#password"
    And I click on "Login"
    Then I should see a modal dialog with title "Project"

  Scenario: Logout
    When I login with token "foobar"
    And I select the project "foo/bar"
    And I open the user menu
    And I click on "Logout"
    Then I should see "Authentication"


