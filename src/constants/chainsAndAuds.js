/* JWTs have aud claims (App IDs). To be multichain, we're allowing one aud per chain. 
* Otherwise, somebody could replay attack from one chain to another. But these auds are UUIDs
* and not always human-readable, so these are mappings to make them easier to deal with: */

// Note: All PASS auds are human readable (they're just the chain name, e.g. mumbai) so they are not included here.
export const appIDForChain = {
  "orcid" : {
    "gnosis" : "APP-MPLI0FQRUVFEKMYX",
    "mumbai" : "APP-TUDV82T8W5ZLSB5B"
  }
}

export const chainForAppID = {
    "APP-MPLI0FQRUVFEKMYX" : "gnosis",
    "APP-TUDV82T8W5ZLSB5B" : "mumbai",
    "gnosis" : "gnosis",
    "mumbai" : "mumbai"
}