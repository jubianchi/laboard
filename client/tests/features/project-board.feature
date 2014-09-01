Feature: Project board

  As a Laboard user & project master
  I should be able to bootstrap a project's board
  In order to manage my issues

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And I am "master" on "foo/bar"
    And I go to "/"
    And I login with token "foobar"

  Scenario: Project has no column
    When I click on "td" containing "foo/bar"
    Then I should see "No column"
    And I should see "create some columns"
    And I should see "use the default columns"

  Scenario: Use default columns set
    When I click on "td" containing "foo/bar"
    And I click on "a" containing "use the default columns"
    Then I should see a column with title "Sandbox"
    And I should see a column with title "Backlog"
    And I should see a column with title "Accepted"
    And I should see a column with title "Review"
    And I should see a column with title "Done"

  Scenario: Manually create column
    When I click on "td" containing "foo/bar"
    And I click on "a" containing "create some columns"
    Then I should see a modal dialog

    When I type "Todo" in "#title"
    And I click on ".modal-footer button" containing "Save"
    Then I should see a column with title "Todo"
