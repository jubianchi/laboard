Feature: Laboard

  As a Gitlab user
  I should be able to use Laboard

  Scenario: Homepage
    When I go to laboard
    Then the title should be equal to "Laboard"
    And I should see "Authentication"
