// major_issuers.js

// Step 1: Define the table data (from your list)
const creditCardIssuers = [
    {
        issuer: "JPMorgan Chase Bank",
        cards: ["Chase Freedom", "Chase Freedom Flex", "Chase Freedom Unlimited", "Chase Sapphire Preferred", "Chase Sapphire Reserve", "Chase Ink Business Preferred", "Amazon Prime Visa"]
    },
    {
        issuer: "Capital One Bank",
        cards: ["Venture", "Venture X", "Quicksilver", "Savor", "SavorOne"]
    },
    {
        issuer: "Citibank (Citi)",
        cards: ["Citi Double Cash", "Citi Custom Cash", "Citi Premier", "Costco Anywhere Visa"]
    },
    {
        issuer: "Bank of America",
        cards: ["Customized Cash Rewards", "Travel Rewards", "Premium Rewards"]
    },
    {
        issuer: "Wells Fargo Bank",
        cards: ["Active Cash", "Autograph", "Reflect"]
    },
    {
        issuer: "American Express",
        cards: ["Blue Cash Everyday", "Blue Cash Preferred", "Amex Gold", "Amex Platinum", "Delta SkyMiles"]
    },
    {
        issuer: "Discover Bank",
        cards: ["Discover it Cash Back", "Discover it Chrome", "Discover it Miles"]
    },
    {
        issuer: "U.S. Bank",
        cards: ["Cash+", "Altitude Go", "Altitude Reserve"]
    },
    {
        issuer: "Synchrony Bank",
        cards: ["Amazon Store Card", "PayPal Credit", "Lowe’s Advantage", "Sam’s Club Mastercard"]
    },
    {
        issuer: "Barclays US",
        cards: ["JetBlue Plus", "Wyndham Rewards", "AAdvantage Aviator Red"]
    },
    {
        issuer: "PNC Bank",
        cards: ["PNC Cash Rewards", "PNC Points"]
    },
    {
        issuer: "Comenity Bank (Bread Financial)",
        cards: ["Victoria’s Secret", "Ulta Beauty", "Caesars Rewards"]
    },
    {
        issuer: "USAA",
        cards: ["USAA Rewards Visa", "USAA Cashback Rewards Plus"]
    },
    {
        issuer: "Navy Federal Credit Union",
        cards: ["cashRewards", "More Rewards Amex", "Flagship Rewards"]
    },
    {
        issuer: "Apple Card (Goldman Sachs)",
        cards: ["Apple Card"]
    }
];

// Step 2: Build the payload
const buildPayload = (userName) => {
    const userCards = creditCardIssuers.flatMap((issuerEntry) =>
        issuerEntry.cards.map((card) => ({
            issuer: issuerEntry.issuer.replace(/ \(.+\)/, ""), // clean up parentheses
            cardProduct: card
        }))
    );

    return {
        name: userName,
        userCards
    };
};

// Step 3: Example usage
const payload = buildPayload("Murari Chakrakodi");

// Step 4: Output (to console or send to API)
console.log(JSON.stringify(payload, null, 4));
await fetch("https://your-api-endpoint.com/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});
