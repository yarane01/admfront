//user
/*
 {
 "systemid" : 1586002,
 "loginname" : "ib1trader",
 "password" : "ib1trader",
 "resetpasswordemail" : null,
 "closed" : "N",
 "islocked" : false,
 "usern" : "",
 "tradingstate" : "D",
 "onlinestatus" : 0,
 "lastlogged" : null,
 "roles" : ["Trader"],
 "traderonaccounts" : ["ib1trader"],
 "ownerofaccounts" : ["ib1trader"],
 "firstname" : " ",
 "lastname" : " ",
 "address" : " ",
 "city" : " ",
 "state" : " ",
 "zip" : null,
 "country" : "  ",
 "email" : null,
 "dayphone" : null,
 "homephone" : null,
 "userversionid" : 0,
 "userinfoversionid" : 0,
 "hierarchynodeid" : 36719,
 "parenthierarchynodeid" : 36718,
 "parenthierarchynodename" : "IB One users"
 }
 */

//account
/*
 {
 "systemid" : 1585562,
 "accountn" : "a_u_100_1",
 "type" : 0,
 "ownerid" : 1585542,
 "ownertype" : 1,
 "traderid" : 1585542,
 "tradertype" : 1,
 "balance" : 0.0,
 "usedmargin" : 0.0,
 "interestaccrued" : 0.0,
 "basecurrency" : "USD",
 "status" : 0,
 "referencen" : 0,
 "description" : "created for test",
 "opendate" : "2015-11-03",
 "marketmakerunitid" : 100,
 "lotsizeratio" : 0.0,
 "accountclosed" : "N",
 "pam_lock" : 0,
 "pam_changed" : 0,
 "hierarchynodeid" : 36697,
 "parenthierarchynodeid" : 100,
 "parenthierarchynodename" : "Visual_Trading",
 "ownername" : "u_100_1",
 "tradername" : "u_100_1",
 "usablemargin" : 0.0,
 "pnl" : 0.0,
 "equity" : 0.0
 }
 */

//unit
/*
 {
 "systemid" : 100,
 "type" : 0,
 "daynight" : 0,
 "marketstatus" : 0,
 "parentmarketmakerunitid" : 0,
 "versionid" : 1,
 "name" : "Visual_Trading",
 "defaultcurrency" : "USD",
 "timezone" : "America/New_York",
 "description" : "Primary Market Maker",
 "url" : "http://www.vtsystems.com/",
 "closed" : "N",
 "unitn" : "100",
 "hasstp" : "N",
 "hierarchynodeid" : 100,
 "parenthierarchynodeid" : 0
 }
 */

//trade
/*
 {
 "tradeid" : 6463959,
 "accountid" : 1585522,
 "opendate" : "2015-11-03",
 "closedate" : null,
 "opendateasstring" : "2015-11-03 00:00:00",
 "closedateasstring" : "",
 "openrate" : 1.24591,
 "closerate" : 0.0,
 "openamount" : 100000.0,
 "closeamount" : 0.0,
 "profitloss" : 0.0,
 "instrumentid" : 0,
 "symbol" : "EURUSD",
 "accountn" : "trader",
 "owner" : "tradermo",
 "trader" : "trader"
 }
 */


//from table settingenumeration
var settingenumeration = {
    "10": {"0": "money", "1": "pips", "2": "formula"},
    "1016": {"0": "Market(if within Trader Range)", "1": "Order", "2": "Market", "3": "Worse(Order,Market)"},
    "1017": {"0": "Market(if within Trader Range)", "1": "Order", "2": "Market", "3": "Worse(Order,Market)"},
    "1018": {"1": "Order", "2": "Market", "3": "Worse(Order,Market)"},
    "1019": {"1": "Order", "2": "Market", "3": "Worse(Order,Market)"},
    "1027": {
        "0": "close FIFO",
        "1": "hedge",
        "2": "close MAX PROFIT",
        "3": "close MAX LOSS",
        "4": "close ALL",
        "5": "notification"
    },
    "1030": {"0": "Equity", "1": "MIN(Equity, Balance)"},
    "1031": {"0": "default", "1": "smart"},
    "1042": {"1": "pay", "0": "do not pay", "-1": "charge", "100": "Min(Buy Charge, Sell Charge)"},
    "1043": {"1": "charge", "0": "do not charge", "-1": "pay", "100": "Min(Buy Pay, Sell Pay)"},
    "1500": {
        "1": "Check by history only",
        "2": "Check by history, quoteId required",
        "3": "Check by history, quoteId is encoded",
        "4": "Check by history, quoteId is required and encoded"
    }
};

//from table instrument_type
var instrumenttypemap =
{
    "0": 'Forex',
    "1": 'CFD',
    "2": 'Metal',
    "3": 'Energy',
    "4": 'Commodities',
    "5": 'Indices',
    "6": 'Equities',
    "7": 'Bonds',
    "8": 'Crypto',
    "9": 'CashEquities',
    "10": 'Futures',
    "11": 'ETF
};

//from table rangetype
var rangetypemap =
{
    "0": 'Opening Lots',
    "1": 'Closed Lots',
    "2": 'Account Balance',
    "3": 'Dates',
    "4": 'Symbols',
    "5": 'Instruments',
    "6": 'Unused Margin',
    "7": 'Unhedged Money',
    "8": 'Unhedged Lots'
};

// from table settingrangemap
// SYSTEMSETTINGID:[RANGETYPE]
var settingrangemap =
{
    "22": ['4'],
    "1001": ['5'],
    "1050": ['8'],
    "1051": ['8'],
    "1060": ['0', '2'],
    "1062": ['0', '2'],
    "1070": ['0'],
    "1072": ['0'],
    "1090": ['6'],
    "1052": ['7'],
    "1053": ['7'],
    "1405": ['5']
};

// from accounttranstype table
var transtypemap = {
    "0": 'Close Trade',
    "1": 'Deposit',
    "2": 'Withdraw',
    "3": 'Credit',
    "4": 'Debit',
    "5": 'Transfer',
    "6": 'Commission',
    "7": 'Payoff',
    "8": 'MarginInterest',
    "9": 'Rollover',
    "10": 'Transaction Fee',
    "11": 'Adjust',
    "12": 'Commission Payoff',
    "13": 'Markup Payoff',
    "14": 'RateShift Payoff',
    "15": 'Take Profit Payoff',
    "16": 'PAM Group account update',
    "17": 'PAM Managed account update'
};

var accounttypemap = {
    "0": "Trading",
    "2": "Compensation"
}

var isoCountries = {
    'AD': 'Andorra',
    'AE': 'United Arab Emirates',
    'AF': 'Afghanistan',
    'AG': 'Antigua and Barbuda',
    'AI': 'Anguilla',
    'AL': 'Albania',
    'AM': 'Armenia',
    'AN': 'Netherlands Antilles',
    'AO': 'Angola',
    'AR': 'Argentina',
    'AS': 'Ascension',
    'AT': 'Austria',
    'AU': 'Australia',
    'AW': 'Aruba',
    'AZ': 'Azerbaijan',
    'BA': 'Bosnia and Herzegovina',
    'BB': 'Barbados',
    'BD': 'Bangladesh',
    'BE': 'Belgium',
    'BF': 'Burkina Faso',
    'BG': 'Bulgaria',
    'BH': 'Bahrain',
    'BI': 'Burundi',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BN': 'Brunei Darussalam',
    'BO': 'Bolivia',
    'BR': 'Brazil',
    'BS': 'Bahamas',
    'BT': 'Bhutan',
    'BW': 'Botswana',
    'BY': 'Belarus',
    'BZ': 'Belize',
    'CA': 'Canada',
    'CD': 'Congo, Democratic Republic of the',
    'CF': 'Central African Republic',
    'CG': 'Congo, Republic of the (Brazzaville)',
    'CH': 'Switzerland',
    'CI': 'C?te d?Ivoire (Ivory Coast)',
    'CL': 'Chile',
    'CM': 'Cameroon',
    'CN': 'China',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CU': 'Cuba',
    'CV': 'Cape Verde',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DE': 'Germany',
    'DJ': 'Djibouti',
    'DK': 'Denmark',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'DZ': 'Algeria',
    'EC': 'Ecuador',
    'EE': 'Estonia',
    'EG': 'Egypt',
    'ER': 'Eritrea',
    'ES': 'Spain',
    'ET': 'Ethiopia',
    'FI': 'Finland',
    'FJ': 'Fiji',
    'FK': 'Falkland Islands',
    'FO': 'Faroe Islands',
    'FR': 'France',
    'GA': 'Gabon',
    'GB': 'United Kingdom',
    'GD': 'Grenada',
    'GE': 'Georgia, Republic of',
    'GF': 'French Guiana',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GL': 'Greenland',
    'GM': 'Gambia',
    'GN': 'Guinea',
    'GP': 'Guadeloupe',
    'GQ': 'Equatorial Guinea',
    'GR': 'Greece',
    'GT': 'Guatemala',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HK': 'Hong Kong',
    'HN': 'Honduras',
    'HR': 'Croatia',
    'HT': 'Haiti',
    'HU': 'Hungary',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IN': 'India',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'IS': 'Iceland',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KE': 'Kenya',
    'KG': 'Kyrgyzstan',
    'KH': 'Cambodia',
    'KI': 'Kiribati',
    'KM': 'Comoros',
    'KN': 'Saint Kitts and Nevis',
    'KP': 'Korea, Democratic People?s Republic of',
    'KR': 'Korea, Republic of',
    'KW': 'Kuwait',
    'KY': 'Cayman Islands',
    'KZ': 'Kazakhstan',
    'LA': 'Laos',
    'LB': 'Lebanon',
    'LC': 'Saint Lucia',
    'LI': 'Liechtenstein',
    'LK': 'Sri Lanka',
    'LR': 'Liberia',
    'LS': 'Lesotho',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'LV': 'Latvia',
    'LY': 'Libya',
    'MA': 'Morocco',
    'MD': 'Moldova',
    'ME': 'Montenegro, Republic of',
    'MG': 'Madagascar',
    'MK': 'Macedonia',
    'ML': 'Mali',
    'MM': 'Burma',
    'MN': 'Mongolia',
    'MO': 'Macao',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MS': 'Montserrat',
    'MT': 'Malta',
    'MU': 'Mauritius',
    'MV': 'Maldives',
    'MW': 'Malawi',
    'MX': 'Mexico',
    'MY': 'Malaysia',
    'MZ': 'Mozambique',
    'NA': 'Namibia',
    'NC': 'New Calendonia',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NI': 'Nicaragua',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'NP': 'Nepal',
    'NR': 'Nauru',
    'NZ': 'New Zealand',
    'OM': 'Oman',
    'OT': 'Other',
    'PA': 'Panama',
    'PE': 'Peru',
    'PF': 'French Polynesia',
    'PG': 'Papua New Guinea',
    'PH': 'Philippines',
    'PK': 'Pakistan',
    'PL': 'Poland',
    'PM': 'St. Pierre and Miquelon',
    'PN': 'Pitcairn Island',
    'PT': 'Portugal',
    'PY': 'Paraguay',
    'QA': 'Qatar',
    'RE': 'Reunion',
    'RO': 'Romania',
    'RS': 'Serbia, Republic of',
    'RU': 'Russia',
    'RW': 'Rwanda',
    'SA': 'Saudi Arabia',
    'SB': 'Solomon Islands',
    'SC': 'Seychelles',
    'SD': 'Sudan',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'SH': 'St. Helena',
    'SI': 'Slovenia',
    'SK': 'Slovak Republic',
    'SL': 'Sierra Leone',
    'SM': 'San Marino',
    'SN': 'Senegal',
    'SO': 'Somalia',
    'SR': 'Suriname',
    'ST': 'Sao Tome and Principe',
    'SV': 'El Salvador',
    'SY': 'Syrian Arab Republic (Syria)',
    'SZ': 'Swaziland',
    'TC': 'Turks and Caicos Islands',
    'TD': 'Chad',
    'TG': 'Togo',
    'TH': 'Thailand',
    'TJ': 'Tajikistan',
    'TM': 'Turkmenistan',
    'TN': 'Tunisia',
    'TO': 'Tonga',
    'TR': 'Turkey',
    'TT': 'Trinidad and Tobago',
    'TU': 'Tristan da Cunha',
    'TV': 'Tuvalu',
    'TW': 'Taiwan',
    'TZ': 'Tanzania',
    'UA': 'Ukraine',
    'UG': 'Uganda',
    'US': 'United States of America',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VA': 'Vatican City',
    'VC': 'Saint Vincent and The Grenadines',
    'VE': 'Venezuela',
    'VG': 'British Virgin Islands',
    'VN': 'Vietnam',
    'VU': 'Vanuatu',
    'WF': 'Wallis and Futuna Islands',
    'WS': 'Western Samoa',
    'YE': 'Yemen',
    'ZA': 'South Africa',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'};


//field labels
var fm = {
    "SYSTEMID": "System identifier",
    "ACCOUNTN": "Account name",
    "TYPE": "Type",
    "OWNERID": "Owner",
    "OWNERTYPE": "Owner type",
    "TRADERID": "Trader",
    "TRADERTYPE": "Trader type",
    "BALANCE": "Balance",
    "USEDMARGIN": "Used margin",
    "INTERESTACCRUED": "Interest accrued",
    "BASECURRENCY": "Account currency",
    "STATUS": "Status",
    "PARENTNODE": "Parent unit or group",
    "LOGINNAME": "Login name",
    "PASSWORD": "Password",
    "RESETPASSWORDEMAIL": "Email for reset password",
    "CLOSED": "is closed",
    "ISLOCKED": "is locked",
    "TRADINGSTATE": "Trading state",
    "ONLINESTATUS": "online status",
    "LASTLOGGED": "Last logged",
    "ROLES": "Roles",
    "TRADERONACCOUNTS": "Trader on accounts",
    "OWNEROFACCOUNTS": "Owner of accounts",
    "FIRSTNAME": "First name",
    "LASTNAME": "Last name",
    "ADDRESS": "Address",
    "CITY": "City",
    "STATE": "State",
    "ZIP": "ZIP",
    "COUNTRY": "Country",
    "EMAIL": "Email",
    "DAYPHONE": "Day phone",
    "HOMEPHONE": "Home phone",
    "HASSTP": "has STP",
    "NAME": "Name",
    "DEFAULTCURRENCY": "Default currency",
    "TIMEZONE": "Time zone",
    "DESCRIPTION": "Description",
    "OPENDATE": "Open date",
    "LOTSIZERATIO": "Lot size ratio",
    "ACCOUNTCLOSED": "is closed",
    "URL": "URL"
//"":"",
};

var currencies = {
    'USD': "United States of America, Dollars",
    'JPY': "Japan, Yen",
    'EUR': "Euro Member Countries, Euro",
    'GBP': "United Kingdom, Pounds",
    'CHF': "Switzerland, Francs",
    'AUD': "Australia, Dollars",
    'CAD': "Canada, Dollars",
    'NOK': "Norway, Krone",
    'SEK': "Sweden, Kronor",
    'NZD': "New Zealand, Dollars",
    'CZK': "Czech koruna",
    'PLN': "Polish zloty",
    'ZAR': "South African Rand",
    'SGD': "Singapore dollar",
    'MXN': "Mexican Peso",
    'DKK': "Danish krone",
    'BTC': "Bitcoin",
    'ETH': "Ethereum",
    'TCO': "ThinkCoin",
    'UST': "Tether"
};

var timezones = {
    'Africa/Cairo': "Africa/Cairo Eastern European Summer Time",
    'Africa/Casablanca': "Africa/Casablanca Western European Summer Time",
    'Africa/Johannesburg': "Africa/Johannesburg South Africa Summer Time",
    'Africa/Lagos': "Africa/Lagos Western African Summer Time",
    'Africa/Nairobi': "Africa/Nairobi Eastern African Summer Time",
    'Africa/Windhoek': "Africa/Windhoek Western African Summer Time",
    'America/Anchorage': "America/Anchorage Alaska Daylight Time",
    'America/Bogota': "America/Bogota Colombia Summer Time",
    'America/Buenos_Aires': "America/Buenos_Aires Argentine Summer Time",
    'America/Caracas': "America/Caracas Venezuela Summer Time",
    'America/Chicago': "America/Chicago Central Daylight Time",
    'America/Chihuahua': "America/Chihuahua Mountain Daylight Time",
    'America/Denver': "America/Denver Mountain Daylight Time",
    'America/Godthab': "America/Godthab Western Greenland Summer Time",
    'America/Guatemala': "America/Guatemala Central Daylight Time",
    'America/Halifax': "America/Halifax Atlantic Daylight Time",
    'America/La_Paz': "America/La_Paz Bolivia Summer Time",
    'America/Los_Angeles': "America/Los_Angeles Pacific Daylight Time",
    'America/Manaus': "America/Manaus Amazon Summer Time",
    'America/Mexico_City': "America/Mexico_City Central Daylight Time",
    'America/Montevideo': "America/Montevideo Uruguay Summer Time",
    'America/New_York': "America/New_York Eastern Daylight Time",
    'America/Phoenix': "America/Phoenix Mountain Daylight Time",
    'America/Regina': "America/Regina Central Daylight Time",
    'America/Santiago': "America/Santiago Chile Summer Time",
    'America/Sao_Paulo': "America/Sao_Paulo Brasilia Summer Time",
    'America/St_Johns': "America/St_Johns Newfoundland Daylight Time",
    'America/Tijuana': "America/Tijuana Pacific Daylight Time",
    'Asia/Amman': "Asia/Amman Eastern European Summer Time",
    'Asia/Baghdad': "Asia/Baghdad Arabia Daylight Time",
    'Asia/Baku': "Asia/Baku Azerbaijan Summer Time",
    'Asia/Bangkok': "Asia/Bangkok Indochina Summer Time",
    'Asia/Beirut': "Asia/Beirut Eastern European Summer Time",
    'Asia/Calcutta': "Asia/Calcutta India Daylight Time",
    'Asia/Colombo': "Asia/Colombo India Daylight Time",
    'Asia/Dhaka': "Asia/Dhaka Bangladesh Summer Time",
    'Asia/Dubai': "Asia/Dubai Gulf Daylight Time",
    'Asia/Irkutsk': "Asia/Irkutsk Irkutsk Summer Time",
    'Asia/Jerusalem': "Asia/Jerusalem Israel Daylight Time",
    'Asia/Kabul': "Asia/Kabul Afghanistan Summer Time",
    'Asia/Karachi': "Asia/Karachi Pakistan Summer Time",
    'Asia/Katmandu': "Asia/Katmandu Nepal Summer Time",
    'Asia/Krasnoyarsk': "Asia/Krasnoyarsk Krasnoyarsk Summer Time",
    'Asia/Novosibirsk': "Asia/Novosibirsk Novosibirsk Summer Time",
    'Asia/Rangoon': "Asia/Rangoon Myanmar Summer Time",
    'Asia/Riyadh': "Asia/Riyadh Arabia Daylight Time",
    'Asia/Seoul': "Asia/Seoul Korea Daylight Time",
    'Asia/Shanghai': "Asia/Shanghai China Daylight Time",
    'Asia/Singapore': "Asia/Singapore Singapore Summer Time",
    'Asia/Taipei': "Asia/Taipei China Daylight Time",
    'Asia/Tashkent': "Asia/Tashkent Uzbekistan Summer Time",
    'Asia/Tehran': "Asia/Tehran Iran Daylight Time",
    'Asia/Tokyo': "Asia/Tokyo Japan Daylight Time",
    'Asia/Vladivostok': "Asia/Vladivostok Vladivostok Summer Time",
    'Asia/Yakutsk': "Asia/Yakutsk Yakutsk Summer Time",
    'Asia/Yekaterinburg': "Asia/Yekaterinburg Yekaterinburg Summer Time",
    'Asia/Yerevan': "Asia/Yerevan Armenia Summer Time",
    'Atlantic/Azores': "Atlantic/Azores Azores Summer Time",
    'Atlantic/Cape_Verde': "Atlantic/Cape_Verde Cape Verde Summer Time",
    'Atlantic/Reykjavik': "Atlantic/Reykjavik Greenwich Mean Time",
    'Atlantic/South_Georgia': "Atlantic/South_Georgia South Georgia Daylight Time",
    'Australia/Adelaide': "Australia/Adelaide Central Summer Time (South Australia)",
    'Australia/Brisbane': "Australia/Brisbane Eastern Summer Time (Queensland)",
    'Australia/Darwin': "Australia/Darwin Central Summer Time (Northern Territory)",
    'Australia/Hobart': "Australia/Hobart Eastern Summer Time (Tasmania)",
    'Australia/Perth': "Australia/Perth Western Summer Time (Australia)",
    'Australia/Sydney': "Australia/Sydney Eastern Summer Time (New South Wales)",
    'Etc/GMT+12': "Etc/GMT+12 GMT-12:00",
    'Etc/GMT+3': "Etc/GMT+3 GMT-03:00",
    'Etc/GMT+5': "Etc/GMT+5 GMT-05:00",
    'Etc/GMT-3': "Etc/GMT-3 GMT+03:00",
    'Europe/Berlin': "Europe/Berlin Central European Summer Time",
    'Europe/Budapest': "Europe/Budapest Central European Summer Time",
    'Europe/Istanbul': "Europe/Istanbul Eastern European Summer Time",
    'Europe/Kiev': "Europe/Kiev Eastern European Summer Time",
    'Europe/London': "Europe/London British Summer Time",
    'Europe/Minsk': "Europe/Minsk Further-eastern European Summer Time",
    'Europe/Moscow': "Europe/Moscow Moscow Daylight Time",
    'Europe/Paris': "Europe/Paris Central European Summer Time",
    'Europe/Warsaw': "Europe/Warsaw Central European Summer Time",
    'Indian/Mauritius': "Indian/Mauritius Mauritius Summer Time",
    'Pacific/Apia': "Pacific/Apia West Samoa Daylight Time",
    'Pacific/Auckland': "Pacific/Auckland New Zealand Daylight Time",
    'Pacific/Fiji': "Pacific/Fiji Fiji Summer Time",
    'Pacific/Guadalcanal': "Pacific/Guadalcanal Solomon Is. Summer Time",
    'Pacific/Honolulu': "Pacific/Honolulu Hawaii Daylight Time",
    'Pacific/Port_Moresby': "Pacific/Port_Moresby Papua New Guinea Summer Time",
    'Pacific/Tongatapu': "Pacific/Tongatapu Tonga Summer Time"
};


var systemIdTypeMap = {
    "0": "Account",
    "1": "User",
    "3": "Group",
    "2": "Unit"
};

