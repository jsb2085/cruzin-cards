# cruzin-cards
Card to inventory app for sandbox.


## Backend Setup
All of this will be done in /backend

1. Create .env file. Add GROQ_API_KEY={your-groq-key} (Should be in /backend)
2. Start your virtual environment and install requirements
    - python3 -m venv venv
    - source venv/bin/active
    - pip install -r requirements.txt
3. Setup Google cloud
    - Go to google cloud
    - login with google account
    - go to console
    - search in search bar, "cloud vision api"
    - enable the api
    - click on manage
    - click credentials
    - click manage service accounts
    - create new service account
    - give service account a name
    - grant this service account owner access (section 2)
    - leave section 3 blank
    - export it as json
    - move your key to an accessible location
    - run 'export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"' at /backend

4. python3 manage.py migrate
5. python3 manage.py runserver