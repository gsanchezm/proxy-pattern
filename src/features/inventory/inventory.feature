Feature: Manage product catalog in the inventory page
    As a Sauce Labs customer
    I want to browse the inventory page and see available products
    So that I can select items to add to my cart

  Background:
    Given the application is launched
    When SauceLab user submit credentials as "valid_user"
    And he is on the inventory page

  Scenario: View list of available products
    Then the user should see a list of available products

  @metrics
  Scenario Outline: Add a product to the cart
    When the user adds the product "<ProductKey>" to the cart
    Then the cart should reflect the item "<ProductKey>"

    Examples:
      | ProductKey    |
      | backpack      |
      | fleece_jacket |
      | onesie        |
