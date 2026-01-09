Feature: Sauce Labs Authentication
  As a Sauce Labs customer
  I want to sign in with valid credentials and see clear errors for invalid attempts
  So that I can securely access the product catalog and checkout flow

  Background:
    Given the application is launched

  Scenario Outline: Authentication outcomes
    When SauceLab user submit credentials as "<userKey>"
    Then "<outcome>" should happen with message "<message>"

    Examples:
      | description         | userKey         | outcome | message                                             |
      | valid login         | valid_user      | access  |                                                     |
      | invalid login       | locked_out_user | error   | Epic sadface: Sorry, this user has been locked out. |
      | missing credentials | empty           | error   | Epic sadface: Username is required                  |

  Scenario: Session handling
    When SauceLab user submit credentials as "valid_user"
    And he log out
    Then the system should return to the login page
