Feature: Select project

  As a Laboard user
  I should be able to select a project
  In order to see its board

  Background:
    Given user "test" has token "foobar"

  Scenario: User has no project
    When I login with token "foobar"
    Then I should see a modal dialog with title "0 project"

  Scenario: User has some projects
    Given project "foo" exists in namespace "bar"
    And project "bar" exists in namespace "foo"

    When I login with token "foobar"
    Then I should see a modal dialog with title "2 projects"
    And I should see "foo/bar" in ".modal-body"
    And I should see "bar/foo" in ".modal-body"

    When I select the project "foo/bar"
    Then I should be on "/foo/bar"
