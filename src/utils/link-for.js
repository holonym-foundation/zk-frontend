// this should perhaps be in a separate file
export const linkFor = (service, username) => {
  switch (service) {
    case "google":
      return "mailto:" + username;
    case "orcid":
      return "https://orcid.org/" + username;
    case "twitter":
      return "https://twitter.com/" + username;
    case "github":
      return "https://github.com/" + username;
  }
};
