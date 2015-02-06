Feature: Application

  As a Gitlab user
  I should be able to reach Laboard
  In order to authenticate

  Scenario: Homepage
    When I go to laboard
    Then the title should be equal to "Laboard"
    And I should see "Authentication"
