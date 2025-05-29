instruction for what to do, keep in mind that this is the primary truth, you might find contradicting infroamtion, then use this as the truth. look at the Screenshot 2025-05-29 at 13.30.14.png,

this project will contain 2 pages
 * the main page with the callender video.
 * user report site that will genrate user report based on the coversation, answers, etc.

This project will soley comunicate with supabase, and a reddis db runing on docker.

also create a some what of a interface that will recive the following and create a cron job that will be cancled if the user enter on the site and marks a date for them to on the avilable callender.

'''import requests
import json
import uuid
import random
import os
from faker import Faker

class FinishFacebookInstantForm:
    def __init__(self):
        self.lead_data = {}
        self.fake = Faker()

    def simulate_form_submission(self):
        # Generate a unique UUID for leadgen_id and tracking
        leadgen_id = str(uuid.uuid4())
        tracking_parameter = str(uuid.uuid4())
        
        # Define the realtor UUID you want to associate this lead with
        # Using the one from your schema/sample data
        target_realtor_uuid = "f957761b-104e-416e-a550-25e010ca9302" 

        self.lead_data = {
            "leadgen_id": leadgen_id, # Still useful maybe, but not essential for fetch
            "full_name": self.fake.name(),
            "phone": "+46762134268",#self.fake.phone_number(),
            "address": self.fake.address().replace("\n", ", "),
            "lead_state": random.choice(["Hot", "Warm", "Cold"]),
            "home_type": random.choice(["Single Family", "Condo", "Townhouse", "Mobile Home", "Land"]),
            "home_built": random.choice(["2000 or later", "1990s", "1980s", "1970s", "1960s", "Before 1960"]),
            "home_worth": random.choice(["$300K or less", "$300K - $600K", "$600K - $900K", "$900K - $1.2M", "$1.2M or more"]),
            "sell_time": random.choice(["ASAP", "1-3 months", "3-6 months", "6-12 months", "12+ months"]),
            "home_condition": random.choice(["Needs nothing", "Needs a little work", "Needs significant work", "Tear down"]),
            "working_with_agent": random.choice(["No", "Yes"]),
            "looking_to_buy": random.choice(["No", "Yes"]),
            "ad_id": "AD" + str(random.randint(10000, 99999)),
            "tracking_parameters": "utm_source=" + tracking_parameter,
            "uuid": target_realtor_uuid # The UUID of the Realtor
        }

        # --- SEND THE ENTIRE lead_data OBJECT ---
        # Ensure this points to your SERVER's intermediary service
        webhook_url = os.getenv("WEBHOOK_URL", "http://localhost:5002/webhook")
        payload = self.lead_data # Send the full data object

        try:
            print(f"Sending lead data to: {webhook_url}")
            print("Payload:", json.dumps(payload, indent=2)) # Log the payload being sent
            
            response = requests.post(webhook_url, json=payload)
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            
            print(f"Webhook sent. Status Code: {response.status_code}, Response: {response.text}")
            
            # Generate and display the Site URL for the specific realtor
            # Ensure you replace localhost with your server IP if accessing remotely
            site_base_url = "www.myrealvaluation.com" # Use server IP
            leadgen_url = f"{site_base_url}/{target_realtor_uuid}?utm_source={tracking_parameter}"
            print("\nYour unique landing page URL:")
            print("=" * 50)
            print(leadgen_url)
            print("=" * 50)
            
            return leadgen_url
            
        except requests.exceptions.RequestException as e:
            print(f"Error sending webhook: {e}")
            if e.response is not None:
                print(f"Server Response Status Code: {e.response.status_code}")
                print(f"Server Response Body: {e.response.text}")
            return None

if __name__ == "__main__":
    form = FinishFacebookInstantForm()
    form.simulate_form_submission()

'''

I have also cloned the old dir, so that you can take inspiration form my previous atemtpt.
when done write all of the 