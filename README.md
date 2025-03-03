# **RepAi - Recycling Rewards Platform**  
**AI-Powered Recycling for a Sustainable Future**  
**Built for AI Finance Hackathon 2025 by GDG Cairo**

---

## **Project Overview**
RepAi is an AI-driven web application that incentivizes recycling by providing real-time pricing for recyclable materials, connecting users with collectors, and rewarding them with cashback. By leveraging cutting-edge AI and financial technologies, RepAi transforms recycling into a profitable and sustainable activity for individuals and businesses.

---

## **Key Features**
- **AI-Powered Object Detection:**  
  - Scan any item using **Google Gemini API** to detect recyclable materials and provide pricing information.
- **Receipt Scanning with AI:**  
  - Extract recyclable items from receipts using **Google Image API**.
- **Dynamic Cashback Calculation:**  
  - Automatically calculate cashback rewards based on market prices and user contributions.
- **Reward Redemption:**  
  - Users can redeem cashback through partnerships with eco-friendly companies.
- **Recycling Marketplace:**  
  - Access a database of companies that accept recycled materials or use them in production.
- **Secure Transactions:**  
  - Powered by **Firebase Authentication** and protected by **reCAPTCHA**.

---

## **Technologies Used**
- **Frontend:** Angular  
- **Backend:** Go (Golang)  
- **AI/ML APIs:**  
  - Google Gemini API (Object Detection)  
  - Google Image API (Receipt Scanning)  
  - Imagen 3 (Enhanced Image Processing)  
- **Hosting:** Google Cloud Platform (GCP)  
- **Database:** Firebase Firestore  
- **Authentication:** Firebase Authentication + reCAPTCHA  
- **Finance Integration:** Custom cashback algorithms and reward systems.  

---

## **Why RepAi?**
- **AI Meets Finance:** RepAi combines AI-powered object detection with dynamic cashback calculations, creating a seamless financial incentive for recycling.
- **Sustainability:** Encourages eco-friendly behavior by making recycling profitable.
- **Scalability:** Built on Google Cloud, RepAi can scale to serve millions of users worldwide.
- **Hackathon Fit:** Perfectly aligns with the **AI Finance Hackathon 2025** theme by integrating AI and financial technologies to solve real-world problems.

---

## **Getting Started**
Follow these steps to set up and run the project locally.

### **Prerequisites**
- Go (v1.20 or higher)  
- Angular CLI (v15 or higher)  
- Firebase CLI  
- Google Cloud SDK  

### **Installation**
1. **Clone the Repository.**

2. **Install Frontend Dependencies.**

3. **Install Backend Dependencies.**


4. **Set Up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Add your Firebase configuration.
   - Enable **Firebase Authentication** and **Firestore**.

5. **Set Up Google Cloud:**
   - Enable **Google Gemini API** and **Google Image API** in your GCP project.
   - Add your API keys to the backend configuration.

6. **Set Up reCAPTCHA:**
   - Register your site at [Google reCAPTCHA](https://www.google.com/recaptcha/admin/).
   - Add your reCAPTCHA site key to the frontend configuration.

7. **Run the Application.**

8. **Access the App:**
   - Open your browser and navigate to `http://localhost:4200`.

---

## **Deployment**
RepAi is hosted on **Google Cloud Platform**. Follow these steps to deploy:

1. **Build the Frontend:**
   ```bash
   cd frontend
   ng build --prod
   ```

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy
   ```

3. **Deploy the Backend:**
   - Use **Google Cloud Run** to deploy the Go backend:
     ```bash
     gcloud run deploy repai-backend --image=gcr.io/your-project-id/repai-backend
     ```

4. **Set Up CI/CD:**
   - Use GitHub Actions or Google Cloud Build for automated deployments.

---

## **AI and Finance Integration**
- **AI-Powered Object Detection:**  
  - Uses **Google Gemini API** to identify recyclable materials and provide real-time pricing.
- **Dynamic Cashback Calculation:**  
  - Algorithms calculate cashback based on market prices and user contributions.
- **Receipt Scanning:**  
  - **Google Image API** extracts recyclable items from receipts for cashback rewards.
- **Financial Incentives:**  
  - Users earn cashback, which can be redeemed through partnerships with eco-friendly companies.

---

## **Future Enhancements**
- **Mobile App:** Develop a cross-platform mobile app using Flutter.
- **Blockchain Integration:** Use blockchain for transparent and secure reward transactions.
- **Gamification:** Add gamified elements to encourage more users to recycle.
- **Partnerships:** Expand partnerships with governments and large corporations.

---

## **Contributing**
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.


