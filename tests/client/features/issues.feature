Feature: Search

  As a Laboard user
  I should be able to manage my issues

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And project "foo/bar" has column "Sandbox"
    And project "foo/bar" has column "Todo"
    And project "foo/bar" has issue #13 "First"
    And project "foo/bar" has issue #42 "Second"
    And project "foo/bar" has issue #1337 "Third"
    And I am "master" on project "foo/bar"
    And I login with token "foobar"

  Scenario: Pin issues
    When I select the project "foo/bar"
    And I open the menu of the "Sandbox" column
    And I click on "Pin issues" in the menu of the "Sandbox" column
    Then I should see a modal dialog with title "Issues"

    When I select the issue #13
    And I close the modal dialog
    Then I should see the issue #13 in the "Sandbox" column

    When I open the menu of the "Todo" column
    And I click on "Pin issues" in the menu of the "Todo" column
    And I select the issue #42
    And I select the issue #1337
    And I close the modal dialog
    Then I should see the issue #42 in the "Todo" column
    And I should see the issue #42 in the "Todo" column
