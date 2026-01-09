 Feature: Checkout Process
  As a customer
  I want to complete the checkout process
  So that I can place my order successfully

   Background:
     Given the application is launched
     When SauceLab user submit credentials as "valid_user"
#     And he has items in the cart
#     When he is on checkout step one

#   Scenario Outline: Submit personal info
#     When he submits "<firstName>", "<lastName>", and "<postalCode>"
#     Then next step is checkout step two

#     Examples:
#       | firstName | lastName | postalCode |
#       | John      | Doe      | 12345      |
#       | Jane      | Smith    | 98765      |

#   Scenario Outline: Verify order summary details
#     And the app is on clean status
#     And he is on checkout step two
#     Then it should include the products added previously
#     And include "<paymentMethod>", "<shippingMethod>", "<itemTotal>", "<tax>" and "<total>"

#     Examples:
#       | paymentMethod    | shippingMethod              | itemTotal | tax   | total  |
#       | SauceCard #31337 | Free Pony Express Delivery! | $39.97    | $3.20 | $43.17 |

#   Scenario: Complete checkout
#     And he is on checkout step two
#     When he finishes the checkout
#     Then the confirmation should be displayed

#   Scenario: Cancel from personal info
#     When he cancels the checkout
#     Then the cart stage should be displayed

#   Scenario: Cancel from overview
#     And he is on checkout step two
#     When he cancels the checkout
#     Then he is on the inventory page