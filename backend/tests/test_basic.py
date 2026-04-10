def test_basic_math(): 
    assert 1 + 1 == 2

def test_user_structure():
    user = {"username": "eli", "email": "test@test.com"}
    assert user["username"] == "eli"