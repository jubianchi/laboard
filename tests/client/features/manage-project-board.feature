Feature: Manage project board

  As a Laboard user & project master
  I should be able to manage a project's board

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And project "foo/bar" has column "Sandbox"
    And project "foo/bar" has column "Todo"
    And I am "master" on project "foo/bar"
    And I go to laboard
    And I login with token "foobar"
    And I click on "foo/bar"

  Scenario: Adding a column
    When I click on "Create a new column"
    Then I should see a modal dialog

    When I type "Accepted" in "#title"
    And I click on "Save"
    Then I should see the "Accepted" column

  Scenario: Dropping a column
    When I open the menu of the "Sandbox" column
    And I click on "Drop" in the menu of the "Sandbox" column
    Then I should not see the "Todo" column

  Scenario: Move column left
    When I open the menu of the "Todo" column
    And I click on "Left" in the menu of the "Todo" column
    Then I should see the "Todo" column before the "Sandbox" column

  Scenario: Move column right
    When I open the menu of the "Sandbox" column
    And I click on "Right" in the menu of the "Sandbox" column
    Then I should see the "Sandbox" column after the "Todo" column

  Scenario: Change column theme
    Then the "Sandbox" column should have the "default" theme

    When I open the menu of the "Sandbox" column
    And I click on "Settings" in the menu of the "Sandbox" column
    Then I should see a modal dialog
    When I click on "Blue"
    And I click on "Save"
    Then the "Sandbox" column should have the "info" theme

    When I open the menu of the "Sandbox" column
    And I click on "Settings" in the menu of the "Sandbox" column
    Then I should see a modal dialog
    When I click on "Green"
    And I click on "Save"
    Then the "Sandbox" column should have the "success" theme

    When I open the menu of the "Sandbox" column
    And I click on "Settings" in the menu of the "Sandbox" column
    Then I should see a modal dialog
    When I click on "Yellow"
    And I click on "Save"
    Then the "Sandbox" column should have the "warning" theme

    When I open the menu of the "Sandbox" column
    And I click on "Settings" in the menu of the "Sandbox" column
    Then I should see a modal dialog
    When I click on "Red"
    And I click on "Save"
    Then the "Sandbox" column should have the "danger" theme

    When I open the menu of the "Sandbox" column
    And I click on "Settings" in the menu of the "Sandbox" column
    Then I should see a modal dialog
    When I click on "Default"
    And I click on "Save"
    Then the "Sandbox" column should have the "default" theme

