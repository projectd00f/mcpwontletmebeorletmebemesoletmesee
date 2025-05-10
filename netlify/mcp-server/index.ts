import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CallToolResult,
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";


export const setupMCPServer = (): McpServer => {

  const server = new McpServer(
    {
      name: "stateless-server",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } }
  );

  // Register a prompt template that allows the server to
  // provide the context structure and (optionally) the variables
  // that should be placed inside of the prompt for client to fill in.
  server.prompt(
    "greeting-template",
    "A simple greeting prompt template",
    {
      name: z.string().describe("Name to include in greeting"),
    },
    async ({ name }): Promise<GetPromptResult> => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please greet ${name} in a friendly manner.`,
            },
          },
        ],
      };
    }
  );

  // Register a tool specifically for testing the ability
  // to resume notification streams to the client
  server.tool(
    "start-notification-stream",
    "Starts sending periodic notifications for testing resumability",
    {
      interval: z
        .number()
        .describe("Interval in milliseconds between notifications")
        .default(100),
      count: z
        .number()
        .describe("Number of notifications to send (0 for 100)")
        .default(10),
    },
    async (
      { interval, count },
      { sendNotification }
    ): Promise<CallToolResult> => {
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      let counter = 0;

      while (count === 0 || counter < count) {
        counter++;
        try {
          await sendNotification({
            method: "notifications/message",
            params: {
              level: "info",
              data: `Periodic notification #${counter} at ${new Date().toISOString()}`,
            },
          });
        } catch (error) {
          console.error("Error sending notification:", error);
        }
        // Wait for the specified interval
        await sleep(interval);
      }

      return {
        content: [
          {
            type: "text",
            text: `Started sending periodic notifications every ${interval}ms`,
          },
        ],
      };
    }
  );

  // Create a resource that can be fetched by the client through
  // this MCP server.
  server.resource(
    "greeting-resource",
    "https://wrapship.pro",
    { mimeType: "text/plain" },
    async (): Promise<ReadResourceResult> => {
      return {
        contents: [
          {
            uri: "https://wrapship.pro",
            text: "# WrapShip Documentation

WrapShip - Complete Project Documentation

Project Overview

WrapShip is a React Native mobile application built with Expo SDK 50 that allows users to transform their photos into cartoon-themed images using AI. The app leverages the Replicate API via Supabase edge functions for image transformation and provides a gallery for users to view their transformed images.

#

Table of Contents
Project Structure
Tech Stack
Key Features
Installation & Setup
Authentication
Database Schema
API Integration
Screens & Components
Styling & UI
Configuration Files
Assets
Dependencies
Screens Copy
Transformation Styles

#Project Structure

app-WrapShip/
├── .expo/                  # Expo configuration files
├── .git/                   # Git repository
├── .gitignore              # Git ignore rules
├── .windsurfrules          # Project rules and guidelines
├── App.js                  # Main application entry point
├── README.md               # Project documentation
├── app.json                # Expo configuration
├── assets/                 # Application assets
│   ├── adaptive-icon.png   # Adaptive app icon
│   ├── animations/         # Lottie animation files
│   │   ├── down-arrow.json # Down arrow animation
│   │   ├── loading.json    # Loading animation
│   │   └── success.json    # Success animation
│   ├── app-logo.png        # Application logo
│   ├── icon.png            # App icon
│   ├── splash.png          # Splash screen
│   └── styles/             # Style preview images for transformations
├── eas.json                # EAS build configuration
├── node_modules/           # Node.js dependencies
├── package-lock.json       # Package lock file
├── package.json            # Project dependencies
└── src/                    # Source code
    ├── api/                # API integration
    │   └── replicate.js    # Replicate API integration
    ├── components/         # Reusable components
    │   └── MenuButton.js   # Menu button component
    ├── config/             # Configuration files
    │   ├── styles.js       # Style definitions for transformations
    │   └── supabase.js     # Supabase configuration
    ├── context/            # React context providers
    │   └── AuthContext.js  # Authentication context
    ├── database/           # Database configuration
    │   └── RealmContext.js # Realm database context
    └── screens/            # Application screens
        ├── AuthScreen.js   # Authentication screen
        ├── CreateScreen.js # Create transformation screen
        ├── GalleryScreen.js # Gallery screen
        ├── ImageViewScreen.js # Image viewer screen
        └── menu/           # Menu screens
            ├── EulaScreen.js     # EULA screen
            ├── MenuScreen.js     # Menu screen
            ├── PremiumScreen.js  # Premium subscription screen
            ├── PrivacyScreen.js  # Privacy policy screen
            ├── SupportScreen.js  # Support screen
            └── TermsScreen.js    # Terms of service screen

#Tech Stack

Frontend
Framework: React Native with Expo SDK 50
Navigation: React Navigation (stack & tab)
UI Libraries:
React Native Elements
React Native Paper
Skia
Lottie for animations
State Management: React Context API


Backend

Database: Supabase (PostgreSQL)
Authentication: Expo Apple Authentication
Storage:
AsyncStorage
Expo FileSystem
Expo MediaLibrary
API Integration: Supabase Edge Functions for Replicate API

Payments
React Native IAP (with plans to pivot to RevenueCat)

#Key Features

AI Image Transformation: Transform user photos into cartoon-themed images using various styles
Apple Authentication: Sign in with Apple for user identification
Gallery Management: View and manage transformed images
Freemium Model: Free tier with limited transformations, premium subscription for more
Cross-Platform: Works on both iOS and Android

#Installation & Setup

Prerequisites

Node.js
Expo CLI
iOS device (for iOS development)
Android device (for Android development)

Installation Steps
Clone the repository:
bash

Environment Configuration
The application uses Supabase for backend services. The configuration is stored in src/config/supabase.js:

javascript
const SUPABASE_URL = 'https://YOURSUPABASEURL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-SUPABASE-ANON-KEY';

#Authentication

The application uses Apple Authentication for user sign-in. The authentication flow is managed by the AuthContext in src/context/AuthContext.js.

Authentication Flow
User initiates sign-in with Apple
Expo Apple Authentication handles the authentication process
On successful authentication, the user is signed in to Supabase
If the user is new, a profile is created in the Supabase database
The user is then navigated to the main application

#Database Schema

The Supabase database has the following tables: (When the user names their app, the DB schema should use that name rather than wrapship for db schemas)

WrapShip_users
id (UUID, primary key): Internal user ID
apple_user_id (UUID): Apple user ID for authentication
email (Text): User's email
display_name (Text): User's display name
membership_tier_id (Integer): ID of the user's membership tier
subscription_status (Text): Status of the user's subscription
tier_start_date (Timestamp): Start date of the current tier
images_generated_this_week (Integer): Number of images generated this week
images_generated_this_month (Integer): Number of images generated this month
images_generated_this_year (Integer): Number of images generated this year
weekly_reset_date (Timestamp): Date when weekly counter resets
monthly_reset_date (Timestamp): Date when monthly counter resets
yearly_reset_date (Timestamp): Date when yearly counter resets
monthly_limit (Integer): Monthly limit of image generations
WrapShip_generated_images
id (UUID, primary key): Image ID
user_id (UUID, foreign key): Reference to the user who generated the image
generated_url (Text): URL of the generated image
style (Text): Style used for the transformation
created_at (Timestamp): Creation date
WrapShip_membership_tiers
id (Integer, primary key): Tier ID
Various tier details (not fully explored in the code)

#API Integration
The application uses the Replicate API for image transformation, accessed through Supabase Edge Functions.

Image Transformation Flow
User selects an image and a style
The image is converted to base64
The base64 image and style parameters are sent to the Replicate API via a Supabase Edge Function
The API returns a URL to the transformed image
The transformed image URL is saved to the database and displayed to the user

#Screens & Components

Main Screens
AuthScreen: Handles user authentication with Apple
CreateScreen: Allows users to select an image and style for transformation
GalleryScreen: Displays the user's transformed images
ImageViewScreen: Displays a single transformed image in detail

Menu Screens
MenuScreen: Main menu screen
PremiumScreen: Premium subscription options
TermsScreen: Terms of service
PrivacyScreen: Privacy policy
EulaScreen: End User License Agreement
SupportScreen: Support information

Components
MenuButton: Button for accessing the menu
AnimatedIcon: Animated icon component
WelcomeCard: Welcome card on the create screen
LoadingOverlay: Loading overlay during image transformation
SuccessOverlay: Success overlay after image transformation

#Styling & UI

The application uses a dark theme with orange accents, creating a lovely atmosphere. The UI is built using:

LinearGradient: For gradient backgrounds
StyleSheet: For component styling
Lottie: For animations
MaterialCommunityIcons: For icons

Color Scheme
Primary Background: Black (#000000)
Accent Color: Orange (#FE5A04)
Text Color: White (#FFFFFF)
Secondary Text Color: Light Gray (#CCCCCC)

#Configuration Files

app.json
Contains Expo configuration, including:

App name: "WrapShip"
Bundle identifiers: "com.your-app-name.WrapShip"
Permissions for camera and photo library
Splash screen and icon settings
eas.json
Contains EAS (Expo Application Services) build configuration.

#Assets

Images
app-logo.png: Application logo
icon.png: App icon
splash.png: Splash screen
adaptive-icon.png: Adaptive app icon for Android

Animations
loading.json: Loading animation
success.json: Success animation
down-arrow.json: Down arrow animation

Style Images
The assets/styles/ directory contains preview images for each transformation style.

#Dependencies

json
{
  "dependencies": {
    "@amplitude/analytics-react-native": "^1.4.13",
    "@expo/config-plugins": "^7.8.0",
    "@expo/metro-runtime": "~3.1.1",
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "@react-native-community/netinfo": "11.1.0",
    "@react-native-community/slider": "4.4.2",
    "@react-native-picker/picker": "2.6.1",
    "@react-native-segmented-control/segmented-control": "2.4.1",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/elements": "^1.3.21",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@realm/react": "^0.11.0",
    "@shopify/react-native-skia": "0.1.221",
    "@supabase/supabase-js": "^2.39.3",
    "date-fns": "^2.30.0",
    "expo": "~50.0.20",
    "expo-apple-authentication": "~6.3.0",
    "expo-application": "~5.8.4",
    "expo-auth-session": "~5.4.0",
    "expo-av": "~13.10.4",
    "expo-blur": "~12.9.1",
    "expo-build-properties": "~0.11.0",
    "expo-crypto": "~12.8.1",
    "expo-dev-client": "~3.3.12",
    "expo-device": "~5.9.4",
    "expo-file-system": "~16.0.9",
    "expo-font": "~11.10.2",
    "expo-image-picker": "~14.7.1",
    "expo-linear-gradient": "~12.7.1",
    "expo-linking": "~6.2.2",
    "expo-media-library": "~15.9.2",
    "expo-notifications": "~0.27.6",
    "expo-splash-screen": "~0.26.4",
    "expo-status-bar": "~1.11.1",
    "expo-web-browser": "~12.8.2",
    "lottie-react-native": "6.5.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.73.6",
    "react-native-device-info": "^10.12.0",
    "react-native-dotenv": "^3.4.9",
    "react-native-elements": "^3.4.3",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-iap": "^12.16.2",
    "react-native-modal": "^13.0.1",
    "react-native-paper": "^5.12.1",
    "react-native-picker-select": "^9.0.0",
    "react-native-reanimated": "~3.6.2",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-native-snap-carousel": "^3.9.1",
    "react-native-svg": "14.1.0",
    "react-native-toast-message": "^2.2.0",
    "react-native-track-player": "^4.0.1",
    "react-native-web": "~0.19.6",
    "realm": "^20.1.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.26.10"
  }
}
This comprehensive documentation provides all the information needed to understand and recreate the WrapShip project, including its structure, features, configuration, and dependencies.


#Screens Copy

Here is the copy used on all screens within WrapShip:

Based on my examination of the HorriFAI application, here's a comprehensive list of all the copy text used on each screen:

WrapShip App Copy Text by Screen

Auth Screen
"Transform Your Photos into Cartoon Masterpieces"
"EULA"
"Terms of Service"
"Privacy Policy"
"Version [dynamic version number]"

Create Screen
Welcome Card
"Welcome to WrapShip!"
"Transform your photos into animated masterpieces"
"Start by choosing or taking a photo"
"Select a fun transformation style below"

Button Labels
"Take Photo"
"Choose Photo"
"Choose Your Fun Transformation Style"
"Generate Now"

Loading Overlay
"Transforming your image into something cute..."
Success Overlay
"Generation Complete!"
"Your transformed image has been added to your gallery"
"Got it!"

Error Messages
"No Image" - "Please select an image first"
"No Style" - "Please select a style first"
"Auth Error" - "Please sign in again"
"Generation Failed" - "Failed to generate image. Please try again."
"Save Error" - "Failed to save your generated image after multiple attempts. The image was generated but not saved to your gallery."
"Error" - "Failed to generate image"

Gallery Screen
"Your Gallery"
"⚠️ Images shown here are only stored on our servers for approximately 8 hours. Download any you want to keep!"

Empty State
"No transformed images yet"
"Create your first transformation to see it here"

Image View Screen
Share Message
"Check out this cute photo transformation I made with WrapShip!"

Alert Messages
"Permission needed" - "Please grant permission to save images"
"Success" - "Image saved to your gallery"
"Error" - "Failed to download image"
"Error" - "Failed to share image"

Menu Screen

Menu Items
"WrapShip Premium"
"Terms of Service"
"Privacy Policy"
"EULA"
"Contact Support"

Support Screen
"Contact Support"
"Our support team is ready to assist you with any questions or issues you may have. We will get back to you as soon as we possibly can. Until then - Happy Cute Creating!"
"How can we help you?"
Support Categories
"Feature Request" - "Have a great idea to make our app even better? We'd love to hear it!"
"Account Help" - "Need assistance with your account settings or access?"
"Image Generation" - "Having issues with creating horror images or need help with the generator?"
"Billing Support" - "Questions about your subscription or payment? Our team can help."
"Report a Bug" - "Something not working right? Let us know and we'll fix it ASAP."
"Contact Us"

Premium Screen
"What's Included:"

Features List
"Premium AI Cartoon Image Generation"
"Priority Processing"
"Exclusive Animated Styles"
"Early Access to New Features"

Subscription Plans
"Weekly" - "$1.99 per week" - "20 generations" - "$[dynamic] per generation" - "Subscribe"
"Monthly" - "$4.99 per month" - "80 generations" - "$[dynamic] per generation" - "Subscribe"
"Yearly" - "$24.99 per year" - "1000 generations" - "$[dynamic] per generation" - "Subscribe"
"Best Value"
"Save $[dynamic] a year"
"(compared to $4.99 × 12)"
Footer Text
"Plans auto-renew. Cancel anytime."
"Terms of Service"
"Privacy Policy"
"EULA"
"Contact Support"
"Restore Purchases"



EULA Screen Copy
Title
LICENSED APPLICATION END USER LICENSE AGREEMENT

Content
Apps made available through the App Store are licensed, not sold, to you. Your license to each App is subject to your prior acceptance of either this Licensed Application End User License Agreement ("Standard EULA"), or a custom end user license agreement between you and the Application Provider ("Custom EULA"), if one is provided. Your license to any Apple App under this Standard EULA or Custom EULA is granted by Apple, and your license to any Third Party App under this Standard EULA or Custom EULA is granted by the Application Provider of that Third Party App. Any App that is subject to this Standard EULA is referred to herein as the "Licensed Application." The Application Provider or Apple as applicable ("Licensor") reserves all rights in and to the Licensed Application not expressly granted to you under this Standard EULA.

a. Scope of License
Licensor grants to you a nontransferable license to use the Licensed Application on any Apple-branded products that you own or control and as permitted by the Usage Rules. The terms of this Standard EULA will govern any content, materials, or services accessible from or purchased within the Licensed Application as well as upgrades provided by Licensor that replace or supplement the original Licensed Application, unless such upgrade is accompanied by a Custom EULA. Except as provided in the Usage Rules, you may not distribute or make the Licensed Application available over a network where it could be used by multiple devices at the same time. You may not transfer, redistribute or sublicense the Licensed Application and, if you sell your Apple Device to a third party, you must remove the Licensed Application from the Apple Device before doing so. You may not copy (except as permitted by this license and the Usage Rules), reverse-engineer, disassemble, attempt to derive the source code of, modify, or create derivative works of the Licensed Application, any updates, or any part thereof (except as and only to the extent that any foregoing restriction is prohibited by applicable law or to the extent as may be permitted by the licensing terms governing use of any open-sourced components included with the Licensed Application).

b. Consent to Use of Data
You agree that Licensor may collect and use technical data and related information—including but not limited to technical information about your device, system and application software, and peripherals—that is gathered periodically to facilitate the provision of software updates, product support, and other services to you (if any) related to the Licensed Application. Licensor may use this information, as long as it is in a form that does not personally identify you, to improve its products or to provide services or technologies to you.

c. Termination
This Standard EULA is effective until terminated by you or Licensor. Your rights under this Standard EULA will terminate automatically if you fail to comply with any of its terms.

d. External Services
The Licensed Application may enable access to Licensor's and/or third-party services and websites (collectively and individually, "External Services"). You agree to use the External Services at your sole risk. Licensor is not responsible for examining or evaluating the content or accuracy of any third-party External Services, and shall not be liable for any such third-party External Services. Data displayed by any Licensed Application or External Service, including but not limited to financial, medical and location information, is for general informational purposes only and is not guaranteed by Licensor or its agents. You will not use the External Services in any manner that is inconsistent with the terms of this Standard EULA or that infringes the intellectual property rights of Licensor or any third party. You agree not to use the External Services to harass, abuse, stalk, threaten or defame any person or entity, and that Licensor is not responsible for any such use. External Services may not be available in all languages or in your Home Country, and may not be appropriate or available for use in any particular location. To the extent you choose to use such External Services, you are solely responsible for compliance with any applicable laws. Licensor reserves the right to change, suspend, remove, disable or impose access restrictions or limits on any External Services at any time without notice or liability to you.

e. NO WARRANTY
YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT USE OF THE LICENSED APPLICATION IS AT YOUR SOLE RISK. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE LICENSED APPLICATION AND ANY SERVICES PERFORMED OR PROVIDED BY THE LICENSED APPLICATION ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, AND LICENSOR HEREBY DISCLAIMS ALL WARRANTIES AND CONDITIONS WITH RESPECT TO THE LICENSED APPLICATION AND ANY SERVICES, EITHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES AND/OR CONDITIONS OF MERCHANTABILITY, OF SATISFACTORY QUALITY, OF FITNESS FOR A PARTICULAR PURPOSE, OF ACCURACY, OF QUIET ENJOYMENT, AND OF NONINFRINGEMENT OF THIRD-PARTY RIGHTS. NO ORAL OR WRITTEN INFORMATION OR ADVICE GIVEN BY LICENSOR OR ITS AUTHORIZED REPRESENTATIVE SHALL CREATE A WARRANTY. SHOULD THE LICENSED APPLICATION OR SERVICES PROVE DEFECTIVE, YOU ASSUME THE ENTIRE COST OF ALL NECESSARY SERVICING, REPAIR, OR CORRECTION. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES OR LIMITATIONS ON APPLICABLE STATUTORY RIGHTS OF A CONSUMER, SO THE ABOVE EXCLUSION AND LIMITATIONS MAY NOT APPLY TO YOU.

f. Limitation of Liability
TO THE EXTENT NOT PROHIBITED BY LAW, IN NO EVENT SHALL LICENSOR BE LIABLE FOR PERSONAL INJURY OR ANY INCIDENTAL, SPECIAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER, INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, LOSS OF DATA, BUSINESS INTERRUPTION, OR ANY OTHER COMMERCIAL DAMAGES OR LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE LICENSED APPLICATION, HOWEVER CAUSED, REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, OR OTHERWISE) AND EVEN IF LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OF LIABILITY FOR PERSONAL INJURY, OR OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THIS LIMITATION MAY NOT APPLY TO YOU. In no event shall Licensor's total liability to you for all damages (other than as may be required by applicable law in cases involving personal injury) exceed the amount of fifty dollars ($50.00). The foregoing limitations will apply even if the above stated remedy fails of its essential purpose.

g. Export Restrictions
You may not use or otherwise export or re-export the Licensed Application except as authorized by United States law and the laws of the jurisdiction in which the Licensed Application was obtained. In particular, but without limitation, the Licensed Application may not be exported or re-exported (a) into any U.S.-embargoed countries or (b) to anyone on the U.S. Treasury Department's Specially Designated Nationals List or the U.S. Department of Commerce Denied Persons List or Entity List. By using the Licensed Application, you represent and warrant that you are not located in any such country or on any such list. You also agree that you will not use these products for any purposes prohibited by United States law, including, without limitation, the development, design, manufacture, or production of nuclear, missile, or chemical or biological weapons.

h. Commercial Items
The Licensed Application and related documentation are "Commercial Items", as that term is defined at 48 C.F.R. §2.101, consisting of "Commercial Computer Software" and "Commercial Computer Software Documentation", as such terms are used in 48 C.F.R. §12.212 or 48 C.F.R. §227.7202, as applicable. Consistent with 48 C.F.R. §12.212 or 48 C.F.R. §227.7202-1 through 227.7202-4, as applicable, the Commercial Computer Software and Commercial Computer Software Documentation are being licensed to U.S. Government end users (a) only as Commercial Items and (b) with only those rights as are granted to all other end users pursuant to the terms and conditions herein. Unpublished-rights reserved under the copyright laws of the United States.

i. Governing Law
Except to the extent expressly provided in the following paragraph, this Agreement and the relationship between you and Apple shall be governed by the laws of the State of California, excluding its conflicts of law provisions. You and Apple agree to submit to the personal and exclusive jurisdiction of the courts located within the county of Santa Clara, California, to resolve any dispute or claim arising from this Agreement. If (a) you are not a U.S. citizen; (b) you do not reside in the U.S.; (c) you are not accessing the Service from the U.S.; and (d) you are a citizen of one of the countries identified below, you hereby agree that any dispute or claim arising from this Agreement shall be governed by the applicable law set forth below, without regard to any conflict of law provisions, and you hereby irrevocably submit to the non-exclusive jurisdiction of the courts located in the state, province or country identified below whose law governs:

If you are a citizen of any European Union country or Switzerland, Norway or Iceland, the governing law and forum shall be the laws and courts of your usual place of residence.

Specifically excluded from application to this Agreement is that law known as the United Nations Convention on the International Sale of Goods.

------------------------

Terms of Service Screen Copy

Title
Terms and Conditions of Use

Subtitle
Effective Date: 15/02/2025

Introduction
These Terms of Service ("Terms") govern the use of the website, mobile applications, and all associated services (collectively referred to as the "Service") provided by your-app-name ("your-app-name," "we," "us," or "our"). Please review these Terms carefully. By accessing or using the Service, you agree to comply with these Terms in their entirety. If you disagree with any part of these Terms, you are advised to discontinue the use of our Service immediately.

1. Acceptance of Terms
By accessing, browsing, or utilising any component of our Service, you acknowledge that you have read, understood, and agreed to be bound by these Terms and all policies referenced herein, including but not limited to our Privacy Policy. If you do not accept these Terms, you are prohibited from using our Service.

2. Changes to the Terms
We reserve the right to modify these Terms at any time, at our sole discretion. When changes are made, we will update the "Effective Date" at the top of this page and provide a notice of the changes, either by posting on the Service or through other communication channels. Your continued use of the Service after any such modifications constitutes your acceptance of the revised Terms.

3. Service Overview
your-app-name offers a suite of digital tools, platforms, and functionalities that allow users to upload, create, and share content such as text, code, images, and videos ("Submissions"). The Service may also include tools that generate output based on user Submissions ("Output"). By using the Service, you agree to be solely responsible for your interactions with the Service and other users.

4. Account Registration
To access certain features of the Service, you may be required to create an account. When registering, you agree to provide accurate and complete information, and to keep this information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

your-app-name reserves the right to suspend or terminate your account if we suspect any unauthorised access or misuse of the Service.

5. User Conduct
You agree not to use the Service for any unlawful purposes or in violation of these Terms. Specifically, you agree not to: • Post, upload, or distribute any content that infringes the rights of any third party. • Engage in any behaviour that could harm the operation, security, or integrity of the Service. • Use any automated means (e.g., bots, crawlers) to access the Service. • Share offensive, defamatory, or otherwise inappropriate content.

We reserve the right to monitor and review any content posted by users and to remove any material that we deem inappropriate, at our sole discretion.

6. Submissions and Content Ownership
You retain ownership of any intellectual property rights in the Submissions you upload to the Service. By uploading, submitting, or posting any content to the Service, you grant your-app-name a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, and distribute your content in connection with the operation of the Service. You represent that you have all necessary rights to grant such a license and that your Submissions do not violate the rights of any third party.

7. Third-Party Services and Content
The Service may include links to third-party websites or services that are not owned or controlled by your-app-name. We are not responsible for the content, privacy policies, or practices of third-party websites. Your interactions with third-party services are solely between you and the third party.

8. Payment Terms
Some aspects of the Service may require payment. If you purchase any services, you agree to pay all applicable fees and charges. your-app-name uses third-party payment processors to handle transactions. You agree to comply with the terms of the payment processor when making payments.

your-app-name reserves the right to change its pricing or billing methods at any time. We will provide notice of any price changes before they take effect.

9. Data Protection and Privacy
Our collection and use of your personal data are governed by our Privacy Policy, which is incorporated by reference into these Terms. By using the Service, you consent to the collection, storage, and use of your data as outlined in the Privacy Policy.

10. Service Availability
We strive to ensure that the Service is available without interruption. However, we do not guarantee that the Service will always be available or that access will be uninterrupted. From time to time, maintenance or updates may result in the temporary unavailability of the Service.

11. Intellectual Property
All intellectual property rights related to the Service, including software, design, trademarks, and content, belong to your-app-name or its licensors. You are granted a limited, revocable, non-exclusive, and non-transferable license to use the Service for its intended purposes.

Except as explicitly permitted by these Terms, you may not reproduce, distribute, modify, or create derivative works from any part of the Service without your-app-name's prior written consent.

12. Termination of Access
your-app-name reserves the right to suspend or terminate your access to the Service at any time, with or without notice, for any violation of these Terms, misuse of the Service, or any other reason at our discretion.

Upon termination, your rights to use the Service will immediately cease. We may delete any content associated with your account and are under no obligation to maintain or forward such content after termination.

13. Limitation of Liability
To the maximum extent permitted by law, your-app-name, its affiliates, and their respective directors, officers, employees, and agents shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service, even if we have been advised of the possibility of such damages.

Our total liability to you for any claims related to the Service shall not exceed the amount you paid to your-app-name for the Service in the 12 months preceding the claim.

14. Disclaimer of Warranties
The Service is provided "as is" and "as available," without any express or implied warranties. your-app-name disclaims all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the Service will meet your expectations or that it will be uninterrupted or error-free.

15. Indemnification
You agree to indemnify, defend, and hold harmless your-app-name, its affiliates, and their respective directors, officers, employees, and agents from and against any claims, damages, liabilities, costs, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.

16. Governing Law and Dispute Resolution
These Terms are governed by and construed in accordance with the laws of Ireland and The European Union, without regard to its conflict of law principles. Any disputes arising from or relating to these Terms or the Service will be resolved through binding arbitration in the EU.

By using the Service, you agree that any disputes between you and your-app-name will be resolved individually, without resort to any form of class action.

17. Miscellaneous
These Terms constitute the entire agreement between you and your-app-name regarding your use of the Service. If any provision of these Terms is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.

You may not assign or transfer these Terms without your-app-name's prior written consent. your-app-name may freely assign or transfer these Terms.

Failure by your-app-name to enforce any provision of these Terms shall not be construed as a waiver of any provision or right.

18. DMCA Takedown Policy
your-app-name respects the intellectual property rights of others and expects users of the Service to do the same. It is our policy to respond to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA). If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our designated DMCA Agent with the following information in writing: • A physical or electronic signature of the copyright owner or a person authorized to act on behalf of the owner; • Identification of the copyrighted work claimed to have been infringed; • Identification of the material that is claimed to be infringing; • Information sufficient to permit us to contact you; • A statement that you have a good faith belief that the use of the material is not authorized; • A statement that the information in the notification is accurate.

Please send DMCA takedown notices to team@yourapp.com

19. Contact Information
For any questions or concerns regarding these Terms, please contact us at: team@yourapp.com

Version 2.0.99

Privacy Policy Screen Copy
Title
Privacy Policy

Subtitle
Effective Date: 15/02/2025

Introduction
At your-app-name ("your-app-name", "we", "us", or "our"), we are committed to protecting the privacy and security of your personal information. This Privacy Policy outlines how we collect, use, manage, share, and protect your data when you interact with our websites, mobile apps, products, services, or data sets (collectively referred to as the "Services"). This policy also details your rights and choices with respect to your personal information and explains how various privacy regulations across different regions may apply to you.

Our Commitment to Privacy
your-app-name is committed to ensuring that your privacy is respected and protected in compliance with applicable data protection laws, including but not limited to: • The General Data Protection Regulation (GDPR) for users in the European Economic Area (EEA) • The California Consumer Privacy Act (CCPA) for residents of California, United States • The Personal Information Protection and Electronic Documents Act (PIPEDA) for users in Canada • Privacy Act 1988 and the Australian Privacy Principles (APPs) for users in Australia • Lei Geral de Proteção de Dados (LGPD) for users in Brazil • Other local privacy laws applicable to users in different jurisdictions.

1. Data We Collect
We collect the following types of information from and about our users, depending on how you interact with the Services:

Information You Provide: • When you interact with our Services (e.g., create an account, contact customer support, or submit content), we may collect information such as your name, email address, geographic location, phone numbers, and company information ("Contact Information"). • If you register for paid Services, we may collect login credentials, subscription tier details, and transaction history ("User Account Information"). • Should you upload or generate content on our platform, we also collect that data ("Content").

Automatically Collected Information: We automatically collect technical data such as your IP address, browser type, device details, interaction data, and logs (e.g., searches, uploads, and media interactions), which help us enhance your experience and improve the Services ("User Activity Information").

2. How We Use Your Information
The information we collect serves various purposes, including: • Providing the Services: We use your Contact Information, User Account Information, and Content to configure your access, authenticate your identity, and enable seamless use of the Services. • Communication: Your Contact Information is used to respond to inquiries, offer technical support, and send necessary notifications and updates. • Marketing and Promotions: We may use your Contact Information and User Activity Information to notify you of relevant products, promotions, or events, where you can opt out at any time. • Service Maintenance and Security: Data is used to maintain service stability, monitor usage, detect fraudulent activity, and improve system security. • Legal Compliance: We may process your data to comply with legal obligations, protect our legal interests, or enforce our agreements with you. • Service Improvement: Your data helps us refine and improve our products, including the training and enhancement of machine learning models integrated within our platform.

3. Cookies and Tracking Technologies
We use cookies, pixels, and other similar technologies to collect and store information when you use the Services. These technologies help: • Facilitate core functionalities, such as login and session management • Remember your preferences and personalize your experience • Analyse user activity and enhance our Services • We do not deliver targeted advertising, nor sell your data to anyone who does

4. Sharing Your Information
We do not sell your data to third parties. However, we may share your information in specific instances, such as: • With Other Users: In collaborative environments, we may share details such as your name or email with other users for engagement purposes. • With Service Providers: We work with third-party vendors to provide technical services, marketing support, and customer assistance. • With Your Consent: We will share your data with third parties if you explicitly authorize us to do so. • For Legal Purposes: We may disclose your information as required by law, or in response to legal processes.

5. Data Security and Storage
We implement industry-standard security protocols to protect your personal information, but no security measures are entirely foolproof. We store data primarily in the U.S. but may transfer it internationally as necessary for the provision of Services.

6. Data Retention
We retain your data as long as it is necessary for our business operations, legal compliance, or security purposes. Data may be kept for the duration of your account's existence or longer if required by law.

7. Managing Your Preferences and Data
You have several options regarding the personal data we collect: • Opting Out of Marketing Communications: You can opt out of marketing emails by clicking the unsubscribe link or contacting us directly. • Updating Your Information: You can request updates to your personal data by contacting us. • Requesting Data Deletion: You may request deletion of your data by emailing team@your-app-name.com with the subject line: Data Deletion Request

8. Payment Processing
We rely on third-party payment processors (e.g., Stripe) to manage transactions for our Services. Your payment information is handled by these processors and is subject to their privacy policies.

9. Rights for U.S. Residents
Residents of California and other states with privacy regulations have specific rights regarding their personal data. These include: • The right to know what personal data we collect and how we use it • The right to request deletion of personal data • The right to correct inaccurate personal data • The right to opt out of the sale of personal data

10. Rights for EEA Residents (GDPR)
If you are located in the EEA, you are entitled to additional rights under the General Data Protection Regulation (GDPR). These rights include: • Access to your personal data • Correction of inaccurate or incomplete data • Data portability • Erasure of your personal data in certain circumstances • Objection to data processing in specific situations

11. Children's Privacy
Our Services are not intended for individuals under 18, and we do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us to have it removed.

12. Updates to This Policy
We may update this Privacy Policy periodically. Any changes will be posted on our website, and significant updates will be communicated via email or other appropriate means. Continued use of the Services indicates your acceptance of the updated Privacy Policy.

13. Contact Information
For any questions or concerns regarding this Privacy Policy or your personal data, please reach out to us at team@your-app-name.com.

#Transformation Styles

The app includes 14 cartoon transformation styles, each with a name and prompt. Style names include:

Toy Story
Finding Nemo
The Incredibles
Moana
Zootopia
Inside Out
Frozen
The Lion King
Big Hero 6
Kung Fu Panda
Tangled
Encanto
SpongeBob SquarePants
The Simpsons



Each style has a detailed prompt that describes the animated aesthetic to be applied to the user's image.

/config/styles./js holds the styles configuration in the following format:

export const STYLES = [
  { 
    id: 'thelionking', 
    name: 'LionKing', 
    prompt: "disney the lion king, simba, lion king, lions, cartoon, jungle, bright warm weather, africa",
    icon: require('../../assets/styles/lionking.jpg') 
  },
  { 
    id: 'simpsons', 
    name: 'Simpsons', 
    prompt: 'The Simpsons Tv Show, Yellow Skin, Colourful, enchanting, homer simpson, warm landscapes, family, vibrant, heartwarming, funny, Springfield",
    icon: require('../../assets/styles/simpsons.jpg') 
  },
  { 
    id: 'frozen', 
    name: 'Frozen', 
    prompt: "Disney Frozen, Magical, icy, enchanting, Disney princess, snowy landscapes, sisterhood, vibrant, heartwarming, musical, Arendelle",
    icon: require('../../assets/styles/frozen.jpg') 

UI images should be stored in ../../assets/styles/ in .jpg format.


",
          },
        ],
      };
    }
  );
  return server;
};
