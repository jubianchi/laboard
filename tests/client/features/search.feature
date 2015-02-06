Feature: Search

  As a Laboard user
  I should be able to search on project board

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And project "foo/bar" has column "Sandbox"
    And project "foo/bar" has column "Todo"
    And project "foo/bar" has issue #13 "First"
    And project "foo/bar" has issue #42 "Second"
    And project "foo/bar" has issue #1337 "Third"
    And issue #13 of "foo/bar" is in the "Sandbox" column
    And issue #42 of "foo/bar" is in the "Todo" column
    And issue #1337 of "foo/bar" is in the "Todo" column
    And I am not "master" on project "foo/bar"
    And I login with token "foobar"
    And I select the project "foo/bar"

  Scenario: Search suggestion
    When I focus on ".navbar-form input"
    Then I should see "Search issue number" in ".navbar-form .dropdown-menu"
    Then I should see "Search milestones" in ".navbar-form .dropdown-menu"
    Then I should see "Search authors" in ".navbar-form .dropdown-menu"
    Then I should see "Search assignees" in ".navbar-form .dropdown-menu"
    Then I should see "Search assignees and authors" in ".navbar-form .dropdown-menu"
    Then I should see "Search my issues" in ".navbar-form .dropdown-menu"

    When I search for "@"
    Then I should not see "Search issue number" in ".navbar-form .dropdown-menu"
    Then I should not see "Search milestones" in ".navbar-form .dropdown-menu"
    Then I should see "Search authors" in ".navbar-form .dropdown-menu"
    Then I should see "Search assignees" in ".navbar-form .dropdown-menu"
    Then I should see "Search assignees and authors" in ".navbar-form .dropdown-menu"
    Then I should see "Search my issues" in ".navbar-form .dropdown-menu"

    When I search for "@f"
    Then I should not see "Search issue number" in ".navbar-form .dropdown-menu"
    Then I should not see "Search milestones" in ".navbar-form .dropdown-menu"
    Then I should see "Search authors" in ".navbar-form .dropdown-menu"
    Then I should not see "Search assignees" in ".navbar-form .dropdown-menu"
    Then I should not see "Search assignees and authors" in ".navbar-form .dropdown-menu"
    Then I should not see "Search my issues" in ".navbar-form .dropdown-menu"

    When I search for "@me"
    Then I should not see a ".navbar-form .dropdown-menu" element

  Scenario: Search issue
    When I search for "3"
    Then I should see the issue #13 in the "Sandbox" column
    And I should see the issue #1337 in the "Todo" column
    And I should not see the issue #42

    When I search for "#3"
    Then I should not see the issue #13
    And I should not see the issue #1337
    And I should not see the issue #42

    When I search for "#13"
    Then I should see the issue #13 in the "Sandbox" column
    And I should see the issue #1337 in the "Todo" column
    And I should not see the issue #42
