export const preprocEndpoint = "https://preproc-zkp.s3.us-east-2.amazonaws.com";
// old idServerUrl = 'https://zk.sciverse.id'
export const idServerUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://id-server.holonym.io";
export const serverAddress = "0x8281316aC1D51c94f2DE77575301cEF615aDea84";

export const holonymAuthMessage = "Signature requested for holonym.id. Do not sign this on any other website!"

export const stateAbbreviations = {
  ALABAMA: "AL",
  ALASKA: "AK",
  "AMERICAN SAMOA": "AS",
  ARIZONA: "AZ",
  ARKANSAS: "AR",
  CALIFORNIA: "CA",
  COLORADO: "CO",
  CONNECTICUT: "CT",
  DELAWARE: "DE",
  "DISTRICT OF COLUMBIA": "DC",
  "FEDERATED STATES OF MICRONESIA": "FM",
  FLORIDA: "FL",
  GEORGIA: "GA",
  GUAM: "GU",
  HAWAII: "HI",
  IDAHO: "ID",
  ILLINOIS: "IL",
  INDIANA: "IN",
  IOWA: "IA",
  KANSAS: "KS",
  KENTUCKY: "KY",
  LOUISIANA: "LA",
  MAINE: "ME",
  "MARSHALL ISLANDS": "MH",
  MARYLAND: "MD",
  MASSACHUSETTS: "MA",
  MICHIGAN: "MI",
  MINNESOTA: "MN",
  MISSISSIPPI: "MS",
  MISSOURI: "MO",
  MONTANA: "MT",
  NEBRASKA: "NE",
  NEVADA: "NV",
  "NEW HAMPSHIRE": "NH",
  "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM",
  "NEW YORK": "NY",
  "NORTH CAROLINA": "NC",
  "NORTH DAKOTA": "ND",
  "NORTHERN MARIANA ISLANDS": "MP",
  OHIO: "OH",
  OKLAHOMA: "OK",
  OREGON: "OR",
  PALAU: "PW",
  PENNSYLVANIA: "PA",
  "PUERTO RICO": "PR",
  "RHODE ISLAND": "RI",
  "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD",
  TENNESSEE: "TN",
  TEXAS: "TX",
  UTAH: "UT",
  VERMONT: "VT",
  "VIRGIN ISLANDS": "VI",
  VIRGINIA: "VA",
  WASHINGTON: "WA",
  "WEST VIRGINIA": "WV",
  WISCONSIN: "WI",
  WYOMING: "WY",
};


export const primeToCountryCode = {
  2: 'US', // United States
  3: 'AL', // Albania
  5: 'DZ', // Algeria
  7: 'AD', // Andorra
  11: 'AO', // Angola
  13: 'AG', // Antigua and Barbuda
  17: 'AR', // Argentina
  19: 'AM', // Armenia
  23: 'AU', // Australia
  29: 'AT', // Austria
  31: 'AZ', // Azerbaijan
  37: 'BS', // Bahamas
  41: 'BH', // Bahrain
  43: 'BD', // Bangladesh
  47: 'BB', // Barbados
  53: 'BY', // Belarus
  59: 'BE', // Belgium
  61: 'BZ', // Belize
  67: 'BJ', // Benin
  71: 'BT', // Bhutan
  73: 'BO', // "Bolivia, Plurinational State of"
  79: 'BA', // Bosnia and Herzegovina
  83: 'BW', // Botswana
  89: 'BR', // Brazil
  97: 'BN', // Brunei Darussalam
  101: 'BG', // Bulgaria
  103: 'BF', // Burkina Faso
  107: 'BI', // Burundi
  109: 'KH', // Cambodia
  113: 'CM', // Cameroon
  127: 'CA', // Canada
  131: 'CV', // Cape Verde
  137: 'CF', // Central African Republic
  139: 'TD', // Chad
  149: 'CL', // Chile
  151: 'CN', // China
  157: 'CO', // Colombia
  163: 'KM', // Comoros
  167: 'CG', // Congo
  173: 'CD', // "Congo, the Democratic Republic of the",
  179: 'CR', // Costa Rica
  181: 'CI', // Côte d'Ivoire
  191: 'HR', // Croatia
  193: 'CU', // Cuba
  197: 'CY', // Cyprus
  199: 'CZ', // Czech Republic
  211: 'DK', // Denmark
  223: 'DJ', // Djibouti
  227: 'DM', // Dominica
  229: 'DO', // Dominican Republic
  233: 'EC', // Ecuador
  239: 'EG', // Egypt
  241: 'SV', // El Salvador
  251: 'GQ', // Equatorial Guinea
  257: 'ER', // Eritrea
  263: 'EE', // Estonia
  269: 'SZ', // Eswatini, Kingdom of // (formerly Swaziland)
  271: 'ET', // Ethiopia
  277: 'FJ', // Fiji
  281: 'FI', // Finland
  283: 'FR', // France
  293: 'GA', // Gabon
  307: 'GM', // Gambia
  311: 'GE', // Georgia
  313: 'DE', // Germany
  317: 'GH', // Ghana
  331: 'GR', // Greece
  337: 'GD', // Grenada
  347: 'GT', // Guatemala
  349: 'GN', // Guinea
  353: 'GW', // Guinea-Bissau
  359: 'GY', // Guyana
  367: 'HT', // Haiti
  373: 'HN', // Honduras
  // 10000: 'HK', // Hong Kong
  379: 'HU', // Hungary
  383: 'IS', // Iceland
  389: 'IN', // India
  397: 'ID', // Indonesia
  401: 'IR', // "Iran, Islamic Republic of"
  409: 'IQ', // Iraq
  419: 'IE', // Ireland
  421: 'IL', // Israel
  431: 'IT', // Italy
  433: 'JM', // Jamaica
  439: 'JP', // Japan
  443: 'JO', // Jordan
  449: 'KZ', // Kazakhstan
  457: 'KE', // Kenya
  461: 'KI', // Kiribati
  463: 'KP', // "Korea, Democratic People's Republic of"
  467: 'KR', // "Korea, Republic of"
  479: 'KW', // Kuwait
  487: 'KG', // Kyrgyzstan
  491: 'LA', // Lao People's Democratic Republic
  499: 'LV', // Latvia
  503: 'LB', // Lebanon
  509: 'LS', // Lesotho
  521: 'LR', // Liberia
  523: 'LY', // Libya // (formerly Libyan Arab Jamahiriya)
  541: 'LI', // Liechtenstein
  547: 'LT', // Lithuania
  557: 'LU', // Luxembourg
  563: 'MK', // North Macedonia // (formerly "Macedonia, the former Yugoslav Republic of")
  569: 'MG', // Madagascar
  571: 'MW', // Malawi
  577: 'MY', // Malaysia
  587: 'MV', // Maldives
  593: 'ML', // Mali
  599: 'MT', // Malta
  601: 'MH', // Marshall Islands
  607: 'MR', // Mauritania
  613: 'MU', // Mauritius
  617: 'MX', // Mexico
  619: 'FM', // "Micronesia, Federated States of"
  631: 'MD', // "Moldova, Republic of",
  641: 'MC', // Monaco
  643: 'MN', // Mongolia
  647: 'ME', // Montenegro
  653: 'MA', // Morocco
  659: 'MZ', // Mozambique
  661: 'MM', // Myanmar
  673: 'NA', // Namibia
  677: 'NR', // Nauru
  683: 'NP', // Nepal
  691: 'NL', // Netherlands
  701: 'NZ', // New Zealand
  709: 'NI', // Nicaragua
  719: 'NE', // Niger
  727: 'NG', // Nigeria
  733: 'NO', // Norway
  739: 'OM', // Oman
  743: 'PK', // Pakistan
  751: 'PW', // Palau
  757: 'PA', // Panama
  761: 'PG', // Papua New Guinea
  769: 'PY', // Paraguay
  773: 'PE', // Peru
  787: 'PH', // Philippines
  797: 'PL', // Poland
  809: 'PT', // Portugal
  // 10000: 'PR', // Puerto Rico
  811: 'QA', // Qatar
  821: 'RO', // Romania
  823: 'RU', // Russian Federation
  827: 'RW', // Rwanda
  829: 'KN', // Saint Kitts and Nevis
  839: 'LC', // Saint Lucia
  853: 'VC', // Saint Vincent and the Grenadines
  857: 'WS', // Samoa
  859: 'SM', // San Marino
  863: 'ST', // Sao Tome and Principe
  877: 'SA', // Saudi Arabia
  881: 'SN', // Senegal
  883: 'RS', // Serbia
  887: 'SC', // Seychelles
  907: 'SL', // Sierra Leone
  911: 'SG', // Singapore
  919: 'SK', // Slovakia
  929: 'SI', // Slovenia
  937: 'SB', // Solomon Islands
  941: 'SO', // Somalia
  947: 'ZA', // South Africa
  // South: 'TODO' Sudan?
  953: 'ES', // Spain
  967: 'LK', // Sri Lanka,
  971: 'SD', // Sudan,
  977: 'SR', // Suriname,
  983: 'SE', // Sweden,
  991: 'CH', // Switzerland,
  997: 'SY', // Syrian Arab Republic,
  // 10000: 'TW', // "Taiwan, Province of China",
  1009: 'TJ', // Tajikistan,
  1013: 'TZ', // "Tanzania, United Republic of",
  1019: 'TH', // Thailand,
  1021: 'TL', // Timor-Leste,
  1031: 'TG', // Togo,
  1033: 'TO', // Tonga,
  1039: 'TT', // Trinidad and Tobago,
  1049: 'TN', // Tunisia,
  1051: 'TR', // Türkiye,
  1061: 'TM', // Turkmenistan,
  1063: 'TV', // Tuvalu,
  1069: 'UG', // Uganda,
  1087: 'UA', // Ukraine,
  1091: 'AE', // United Arab Emirates,
  1093: 'GB', // United Kingdom,
  1097: 'AF', // Afghanistan
  1103: 'UY', // Uruguay,
  1109: 'UZ', // Uzbekistan,
  1117: 'VU', // Vanuatu,
  1123: 'VE', // "Venezuela, Bolivarian Republic of",
  1129: 'VN', // Viet Nam,
  1151: 'YE', // Yemen,
  1153: 'ZM', // Zambia,
  1163: 'ZW', // Zimbabwe
};
