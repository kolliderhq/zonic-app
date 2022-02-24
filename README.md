# Zonic 

Zonic is an Umbrel app that allows users to open a synthetic USD account directly from their LND node. 

## Main Concept

Zonic looks and feels like a wallet that allows you to swap Lightning Bitcoin to USD. And for the most part it is just an interface
to your LND node. That is, the Bitcoin balance you see is the channel balance of your Node. However, when you convert your Bitcoin into
USD Zonic will trigger a sell order on Kollider to lock in USD value. Conversely if a user wants to convert USD to Bitcoin Zonic will trigger a Buy order. It is as easy as that.

## Why? 
We've talked about why this functionality is useful in a series of blockposts which you can find here:

[LnHedgehog: Protect your Lightning Channel Balances during Bear Markets](https://kollider.medium.com/lnhedgehog-protect-your-lightning-channel-balances-during-bear-markets-680a88979514)