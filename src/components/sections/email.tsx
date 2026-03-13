const EmailTemplate = () => {
  return `
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Newsletter Subscription</title>

    <style>
      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      body{
        font-family: Arial, Helvetica, sans-serif;
        background:#f9fafb;
        padding:20px;
        animation: fadeIn 1.2s ease;
      }

      .container{
        max-width:600px;
        margin:auto;
        background:white;
        border-radius:18px;
        padding:40px;
        border:1px solid #f3f4f6;
        box-shadow:0 15px 40px rgba(0,0,0,0.08);
        text-align:center;
      }

      h1{
        color:#db2777;
        margin-bottom:20px;
        animation: pop 0.8s ease;
      }

      .message{
        color:#4b5563;
        line-height:1.7;
        margin-bottom:30px;
        font-size:16px;
      }

      .button{
        display:inline-block;
        padding:14px 40px;
        background:linear-gradient(135deg,#ec4899,#22c55e);
        color:white;
        text-decoration:none;
        border-radius:40px;
        font-weight:600;
        transition:0.3s;
        animation:pulse 2s infinite;
      }

      .button:hover{
        opacity:0.9;
      }

      .footer{
        margin-top:40px;
        text-align:center;
        font-size:13px;
        color:#9ca3af;
      }

      /* Animations */

      @keyframes fadeIn{
        from{opacity:0; transform:translateY(10px);}
        to{opacity:1; transform:translateY(0);}
      }

      @keyframes pop{
        from{transform:scale(0.9); opacity:0;}
        to{transform:scale(1); opacity:1;}
      }

      @keyframes pulse{
        0%{box-shadow:0 0 0 0 rgba(236,72,153,0.6);}
        70%{box-shadow:0 0 0 12px rgba(236,72,153,0);}
        100%{box-shadow:0 0 0 0 rgba(236,72,153,0);}
      }

      /* Dark Mode Support */

      @media (prefers-color-scheme: dark) {

        body{
          background:#0f172a !important;
        }

        .container{
          background:#1e293b !important;
          border:1px solid #334155 !important;
        }

        h1{
          color:#f472b6 !important;
        }

        .message{
          color:#e2e8f0 !important;
        }

        .footer{
          color:#94a3b8 !important;
        }
      }

    </style>
  </head>

  <body>

    <div class="container">

      <h1>🎉 Successfully Subscribed!</h1>

      <div class="message">
        Thank you for subscribing to our newsletter.  
        You will now receive updates, special offers, and helpful content directly in your inbox.
      </div>

    </div>

  </body>
  </html>
  `;
};

export default EmailTemplate;