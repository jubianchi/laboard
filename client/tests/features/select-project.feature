Feature: Select project

  As a Laboard user
  I should be able to select a project
  In order to see its board

  Background:
    Given user "test" has token "foobar"

  Scenario: User has no project
    When I go to "/"
    And I login with token "foobar"
    Then I should see a ".modal-dialog" element
    And I should see "0 project" in ".modal-header"

  Scenario: User has some projects
    Given project "foo" exists in namespace "bar"
    And project "bar" exists in namespace "foo"

    When I go to "/"
    And I login with token "foobar"
    Then I should see a ".modal-dialog" element
    And I should see "2 projects" in ".modal-header"
    And I should see "foo/bar" in ".modal-body"
    And I should see "bar/foo" in ".modal-body"

    When I click on "foo/bar"
    Then I should be on "/foo/bar"
