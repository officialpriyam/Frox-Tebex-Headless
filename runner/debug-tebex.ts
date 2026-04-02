
import { tebexClient } from "../main/tebex";
import { loadConfig } from "../main/config";

const config = loadConfig();

console.log("Public Token:", config.tebex_public_token);

async function run() {
    console.log("Fetching categories...");
    const packages = await tebexClient.getPackages();

    if (packages.length === 0) {
        console.log("No packages found.");
        return;
    }

    const firstPkg = packages[0];
    console.log("First Package Processed Data:", JSON.stringify(firstPkg, null, 2));

    console.log("Testing Basket Creation...");
    try {
        const basket = await tebexClient.createBasket("TestUser", "http://example.com/success", "http://example.com/cancel");
        if (basket) {
            console.log("Basket created:", basket.ident);
            console.log("Adding package to basket...");
            const updated = await tebexClient.addPackageToBasket(basket.ident, firstPkg.id, 1);
            if (updated) {
                console.log("Package added successfully. Checkout URL:", updated.links.checkout);
            } else {
                console.log("Failed to add package.");
            }
        } else {
            console.log("Failed to create basket.");
        }
    } catch (e) {
        console.error("Basket Error:", e);
    }
}

run().catch(console.error);
