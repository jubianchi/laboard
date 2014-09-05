Feature: Project board

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
    Then I should see a column with title "Accepted"

  Scenario: Dropping a column
    When I click on "Open Todo column menu"
    And I click on "Drop column Todo"
    Then I should not see a column with title "Todo"
