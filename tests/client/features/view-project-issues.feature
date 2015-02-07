Feature: View project issues

  As a Laboard user
  I should be able to view project issues

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And project "foo/bar" has column "Sandbox"
    And project "foo/bar" has column "Todo"
    And I am not "master" on project "foo/bar"
    And I login with token "foobar"

  Scenario: Project has no issues
    When I select the project "foo/bar"
    Then the "Sandbox" column should be empty
    And the "Todo" column should be empty

  Scenario: Project has some issues
    Given project "foo/bar" has issue #42 "First"
    And project "foo/bar" has issue #1337 "Second"

    When I select the project "foo/bar"
    Then the "Sandbox" column should be empty
    And the "Todo" column should be empty

  Scenario: Project has some issues in its columns
    Given project "foo/bar" has issue #42 "First"
    And project "foo/bar" has issue #1337 "Second"
    And issue #42 of "foo/bar" is in the "Sandbox" column
    And issue #1337 of "foo/bar" is in the "Todo" column

    When I select the project "foo/bar"
    Then I should see the issue #42 in the "Sandbox" column
    And I should see the issue #1337 in the "Todo" column
