Feature: Login with private token

  As a Gitlab user
  I should be able to login to Laboard
  Using my Gitlab private token
  In order to use Laboard

  Background:
    Given user "test" has token "foobar"
    And I go to laboard

  Scenario: Display login form
    Then I should be on "/login"
    And I should see a "#password" element
    And I should see a "[type=submit]" element

  Scenario: Authentication failure
    When I click on "Login"
    Then I should see "Authentication failed, please check your token" in ".alert.alert-danger"

  Scenario: Authentication success
    When I type "foobar" in "#password"
    And I click on "Login"
    Then I should be on "/"
