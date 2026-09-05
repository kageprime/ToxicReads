import {StackNav} from '../Navigation/NavigationKeys';
import {Colors} from '../Theme/Colors';
import images from '../assets/images';
import {
  CameraIcon,
  ClearChaceIcon,
  DarkModeIcon,
  DatePickerIcon,
  FileIcon,
  ForgotPasswordIcon,
  HelpIcon,
  LanguageIcon,
  LegalAndPoliciesIcon,
  MoneySendIcon,
  NotificationIcon,
  PasswordChangeIcon,
  PaymentIcon,
  ProfileSettingIcon,
  RatingStar,
  RemoveIcon,
  SecurityIcon,
  VoucherIcon,
  WishlistIcon,
} from '../assets/svg';
import String from '../i18n/String';

export const OnBoardingData = [
  {
    image: images.onBoardingImage1,
  },
  {
    image: images.onBoardingImage2,
  },
  {
    image: images.onBoardingImage3,
  },
];

export const LanguageData = [
  {
    name: 'English (UK)',
    id: 1,
  },
  {
    name: 'English',
    id: 2,
  },
  {
    name: 'Bahasa Indonesia',
    id: 3,
  },
  {
    name: 'Chinese',
    id: 4,
  },
  {
    name: 'Croatian',
    id: 5,
  },
  {
    name: 'Czech',
    id: 6,
  },
  {
    name: 'Danish',
    id: 7,
  },
  {
    name: 'Filipino',
    id: 8,
  },
  {
    name: 'Finland',
    id: 9,
  },
];

export const HomeTabData = [
  {
    id: 1,
    name: 'Novels',
  },
  {
    id: 2,
    name: 'SelfLove',
  },
  {
    id: 3,
    name: 'Science',
  },
  {
    id: 4,
    name: 'Sad',
  },
  {
    id: 5,
    name: 'Romance',
  },
  {
    id: 6,
    name: 'Action',
  },
  {
    id: 7,
    name: 'Others',
  },
];

export const BookData = [
  {
    id: 1,
    image: images.bookImage1,
    title: 'The trials of apollo the burning maze',
    subTitle: 'Action, Adventure',
    msg: 'Greek Mythology, Fantasy',
    payNow: 'Pay Now $ 79',
    originalPrice: '$69',
    soldBy: '2036',
    tax: '$10',
    total: '$79',
    invoiceNumber: '#135675323',
    date: 'July 16 2022',
    withoutDiscountPrice: '$138',
    ratingStar: <RatingStar />,
    rating: 5,
    noOfPeopleRated: 1029,
    author: 'By Mark Manson',
    discount: '50% Off',
    chapterName: 'Mindset not to care ',
    bookTitleText:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's",
    bookParagraphText1:
      ' When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,',
    bookParagraphText2:
      ' Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    bookParagraphHighlightText:
      "“ orem Ipsum has been the industry's standard dummy text ever since the 1500s ”",
    bookParagraphText3:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    id: 2,
    image: images.bookImage2,
    title: 'Sun Tzu - The Art of War: Strategies for competition',
    subTitle: 'Action, Adventure',
    msg: 'Strategic, Fantasy',
    payNow: 'Pay Now $ 75',
    originalPrice: '$72',
    soldBy: '2036',
    tax: '$3',
    total: '$75',
    invoiceNumber: '#135675323',
    date: 'July 16 2022',
    ratingStar: <RatingStar />,
    rating: 4,
    noOfPeopleRated: 1029,
    author: 'By Mark Manson',
    chapterName: 'Mindset not to care ',
    bookTitleText:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's",
    bookParagraphText1:
      ' When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,',
    bookParagraphText2:
      ' Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    bookParagraphHighlightText:
      "“ orem Ipsum has been the industry's standard dummy text ever since the 1500s ”",
    bookParagraphText3:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    id: 3,
    image: images.bookImage4,
    title: 'The Book of Ikigai',
    subTitle: 'Action, Adventure',
    msg: 'Strategic, Fantasy',
    payNow: 'Pay Now $ 79',
    originalPrice: '$72',
    soldBy: '2036',
    tax: '$7',
    total: '$79',
    invoiceNumber: '#135675323',
    date: 'July 16 2022',
    ratingStar: <RatingStar />,
    rating: 2,
    noOfPeopleRated: 1029,
    author: 'By Mark Manson',
    chapterName: 'Mindset not to care ',
    bookTitleText:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's",
    bookParagraphText1:
      ' When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,',
    bookParagraphText2:
      ' Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    bookParagraphHighlightText:
      "“ orem Ipsum has been the industry's standard dummy text ever since the 1500s ”",
    bookParagraphText3:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    id: 4,
    image: images.bookImage3,
    title:
      'The Subtle Art of Not Giving a F*ck: A Counterintuitive Approach to Living a Good Life',
    subTitle: 'Action, Adventure',
    msg: 'Self Development',
    originalPrice: '$169',
    payNow: 'Pay Now $ 174',
    soldBy: '2036',
    tax: '$5',
    total: '$174',
    invoiceNumber: ' #135675323',
    date: 'July 16 2022',
    ratingStar: <RatingStar />,
    rating: 3,
    noOfPeopleRated: 1029,
    author: 'By Mark Manson',
    chapterName: 'Mindset not to care ',
    bookTitleText:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's",
    bookParagraphText1:
      ' When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,',
    bookParagraphText2:
      ' Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    bookParagraphHighlightText:
      "“ orem Ipsum has been the industry's standard dummy text ever since the 1500s ”",
    bookParagraphText3:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
];

export const ChapterListData = [
  ' 1.  Mindset not to care',
  '2. The Feedback Loop from Hell',
  '3. The Subtle Art of Not Giving a Fuck',
  '4. So Mark, What the Fuck Is the Point of This Book Anyway?',
  '5. Happiness Is a Problem',
  '6. The Misadventures of Disappointment Panda',
  '7. Happiness Comes from Solving Problems',
  '8. Emotions Are Overrated',
  '9. Choose Your Struggle',
  '10. You Are Not Special',
  '11. Things Fall Apart',
  '12. The Tyranny of Exceptionalism',
  '13. B-b-b-but, If I’m Not Going to Be Special or Extraordinary, What’s the Point?',
  '14. The Value of Suffering',
  '15. The Self-Awareness Onion',
];

export const RecommendationData = [
  {
    id: 1,
    image: images.bookImage1,
    title: 'The trials of apollo the burning maze',
    subTitle: 'Fantasy',
    price: '$48',
    withoutDiscountPrice: '$99',
    ratingStar: <RatingStar />,
    rating: 5,
  },
  {
    id: 2,
    image: images.bookImage2,
    title: 'Sun Tzu - The Art of War: Strategies for competition',
    subTitle: 'Strategic',
    price: '$73',
    ratingStar: <RatingStar />,
    rating: 4,
  },
  {
    id: 3,
    image: images.bookImage4,
    title: 'The Book of Ikigai',
    subTitle: 'Strategic',
    price: '$73',
    ratingStar: <RatingStar />,
    rating: 2,
  },
  {
    id: 4,
    image: images.bookImage3,
    title:
      'The Subtle Art of Not Giving a F*ck: A Counterintuitive Approach to Living a Good Life',
    subTitle: 'Fantasy',
    price: '$48',
    withoutDiscountPrice: '$99',
    ratingStar: <RatingStar />,
    rating: 3,
  },
  {
    id: 5,
    image: images.bookImage6,
    title: '12 Rules for Life: An Antidote to Chaos',
    subTitle: 'Strategic',
    price: '$73',
    ratingStar: <RatingStar />,
    rating: 3,
  },
];

export const DownloadingBookData = [
  {
    id: 1,
    image: images.bookImage1,
    title: 'The trials of apollo the burning maze',
    data: ' 1.3 GB/2.5 GB',
    speed: '160 MB/s',
    downloadProgress: 0.3,
  },
  {
    id: 2,
    image: images.bookImage2,
    title: 'Sun Tzu - The Art of War: Strategies for competition',
    data: ' 1.3 GB/2.5 GB',
    speed: '80 MB/s',
    downloadProgress: 1,
  },
  {
    id: 3,
    image: images.bookImage4,
    title: 'The Book of Ikigai',
    data: ' 1.3 GB/2.5 GB',
    speed: '150 MB/s',
    downloadProgress: 0.9,
  },
  {
    id: 4,
    image: images.bookImage5,
    title: 'Born a Crime, Stories from a South African Childhood',
    data: '800MB/1.5GB',
    speed: '80 MB/s',
    downloadProgress: 0.2,
  },
  {
    id: 5,
    image: images.bookImage3,
    title:
      'The Subtle Art of Not Giving a F*ck: A Counterintuitive Approach to Living a Good Life',
    data: ' 1.3 GB/2.5 GB',
    speed: '180 MB/s',
    downloadProgress: 0.7,
  },
  {
    id: 6,
    image: images.bookImage6,
    title: '12 Rules for Life: An Antidote to Chaos',
    data: '800MB/1.5GB',
    speed: '200 MB/s',
    downloadProgress: 0.4,
  },
];

export const CompletedBookData = [
  {
    id: 1,
    image: images.bookImage1,
    title: 'The trials of apollo the burning maze',
    complete: String.completed,
  },
  {
    id: 2,
    image: images.bookImage2,
    title: 'Sun Tzu - The Art of War: Strategies for competition',
    complete: String.completed,
  },
  {
    id: 3,
    image: images.bookImage4,
    title: 'The Book of Ikigai',
    complete: String.completed,
  },
  {
    id: 4,
    image: images.bookImage5,
    title: 'Born a Crime, Stories from a South African Childhood',
    complete: String.completed,
  },
  {
    id: 5,
    image: images.bookImage3,
    title:
      'The Subtle Art of Not Giving a F*ck: A Counterintuitive Approach to Living a Good Life',
    complete: String.completed,
  },
  {
    id: 6,
    image: images.bookImage6,
    title: '12 Rules for Life: An Antidote to Chaos',
    complete: String.completed,
  },
];

export const BankDetailsData = [
  {
    id: 1,
    image: images.bankImage1,
    bankName: 'Bank Central Asia',
    subtitle: 'Checked Automaticaly',
  },
  {
    id: 2,
    image: images.bankImage2,
    bankName: 'Bank Negara Indonesia',
    subtitle: 'Checked Automaticaly',
  },
  {
    id: 3,
    image: images.bankImage3,
    bankName: 'Bank Syariah Indonesia',
    subtitle: 'Checked Automaticaly',
  },
  {
    id: 4,
    image: images.bankImage4,
    bankName: 'Bank Mandiri',
    subtitle: 'Checked Automaticaly',
  },
];

export const NotificationData = [
  {
    title: 'Today',
    data: [
      {
        id: 1,
        image: images.userImage1,
        title: 'New message from Endy',
        time: '2 hours Ago',
      },
      {
        id: 2,
        svgIcon: <MoneySendIcon />,
        title: 'You have purchased new Book for you!',
        time: '2 hours Ago',
        detail: String.seeDetails,
      },
      {
        id: 3,
        image: images.userImage2,
        title: 'Jhone added a new Book in Bookly!',
        time: '2 hours Ago',
        bookImage: images.bookImage2,
      },
    ],
  },
  {
    title: 'Yesterday',
    data: [
      {
        id: 1,
        image: images.userImage3,
        title: 'New message from Alex',
        time: '2 hours Ago',
      },
      {
        id: 2,
        svgIcon: <MoneySendIcon />,
        title: 'You have purchased new Book for you!',
        time: '2 hours Ago',
        detail: String.seeDetails,
      },
      {
        id: 3,
        image: images.userBookImage,
        title: 'Jhone added a new Book in Bookly!',
        time: '2 hours Ago',
        detail: String.readBook,
      },
    ],
  },
];

export const MessageData = [
  {
    id: 1,
    image: images.profileImage1,
    userName: 'Richar Kandowen',
    msg: 'Lorem ipsum dolor sit amet...',
    time: '10:20',
    status: String.online,
    msgPending: '2',
    receiverProfileImage: images.profileImage5,
  },
  {
    id: 2,
    image: images.profileImage2,
    userName: 'Jeden Murred',
    msg: 'Lorem ipsum dolor sit amet...',
    time: '10:20',
    status: String.offline,
    msgPending: '2',
    receiverProfileImage: images.profileImage5,
  },
  {
    id: 3,
    image: images.profileImage3,
    userName: 'Chris Offile',
    msg: 'Lorem ipsum dolor sit amet...',
    time: '10:20',
    status: String.offline,
    receiverProfileImage: images.profileImage5,
  },
  {
    id: 4,
    image: images.profileImage4,
    userName: 'Jemmy Fox',
    msg: 'Lorem ipsum dolor sit amet...',
    time: '10:20',
    status: String.offline,
    receiverProfileImage: images.profileImage5,
  },
];

export const ChatData = [
  {
    id: 1,
    message: 'Lorem ipsum dolor sit et, consectetur adipiscing.',
    time: '15:42 PM',
    type: 'sender',
  },
  {
    id: 2,
    message: 'Lorem ipsum dolor sit et',
    time: '15:43 PM',
    type: 'receiver',
  },
  {
    id: 3,
    message: 'Lorem ipsum dolor sit et, consectetur adipiscing.',
    time: '15:43 PM',
    type: 'sender',
  },
];

export const ProfileCategoryData = [
  {
    title: String.personalInfo,
    data: [
      {
        id: 1,
        name: String.profile,
        svgIcon: <ProfileSettingIcon />,
        route: StackNav.EditProfileScreen,
      },
      {
        id: 2,
        name: String.voucher,
        svgIcon: <VoucherIcon />,
        route: StackNav.Voucher,
      },
      {
        id: 3,
        name: String.wishlistBook,
        svgIcon: <WishlistIcon />,
        route: StackNav.WhishlistBook,
      },
      {
        id: 4,
        name: String.paymentMethod,
        svgIcon: <PaymentIcon />,
        route: StackNav.ChoosePayment,
      },
    ],
  },
  {
    title: String.security,
    data: [
      {
        id: 1,
        name: String.changePassword,
        svgIcon: <PasswordChangeIcon />,
        route: StackNav.ChangePassword,
      },
      {
        id: 2,
        name: String.forgotPassWord,
        svgIcon: <ForgotPasswordIcon />,
        route: StackNav.ForgotPassword,
      },
      {
        id: 3,
        name: String.security,
        svgIcon: <SecurityIcon />,
        route: StackNav.Security,
      },
    ],
  },
  {
    title: String.general,
    data: [
      {
        id: 1,
        name: String.language,
        svgIcon: <LanguageIcon />,
        route: StackNav.Language,
      },
      {
        id: 2,
        name: String.clearCache,
        svgIcon: <ClearChaceIcon />,
        data: '88MB',
        route: null,
      },
      {
        id: 3,
        name: String.notification,
        svgIcon: <NotificationIcon />,
        route: StackNav.Notification,
      },
    ],
  },
  {
    title: String.about,
    data: [
      {
        id: 1,
        name: String.legalandPolicies,
        svgIcon: <LegalAndPoliciesIcon />,
        route: StackNav.LegalAndPolicies,
      },
      {
        id: 2,
        name: String.helpandSupport,
        svgIcon: <HelpIcon />,
        route: StackNav.HelpAndSupport,
      },
      {
        id: 3,
        name: String.darkMode,
        svgIcon: <DarkModeIcon />,
        darkMode: 1,
        route: null,
      },
    ],
  },
];

export const GenderDataArr = [
  {
    id: 1,
    name: String.male,
  },
  {
    id: 2,
    name: String.female,
  },
];

export const VoucherData = [
  {
    id: 1,
    image: images.bookImage1,
    title:
      'Redeem Code The trials of apollo the burning maze: Strategies for competition',
    date: 'Until 31 jul, 2022',
  },
  {
    id: 2,
    image: images.bookImage2,
    title: 'Redeem Code Sun Tzu - The Art of War: Strategies for competition',
    date: 'Until 31 jul, 2022',
  },
  {
    id: 3,
    image: images.bookImage3,
    title:
      'Redeem Code LibThe Subtle Art of Not Giving a F*ck: A Counterintuitive Approach to Living a Good Life',
    date: 'Until 31 jul, 2022',
  },
  {
    id: 4,
    image: images.bookImage4,
    title: "Redeem Code The Book of IkigaiHeroes: The King's War",
    date: 'Until 31 jul, 2022',
  },
  {
    id: 5,
    image: images.bookImage5,
    title: 'Redeem Code Sun Tzu - The Art of War: Strategies for competition',
    date: 'Until 31 jul, 2022',
  },
  {
    id: 6,
    image: images.bookImage6,
    title: 'Redeem Code Sun Tzu - The Art of War: Strategies for competition',
    date: 'Until 31 jul, 2022',
  },
];

export const PaymentCardData = [
  {
    id: 1,
    cardName: String.mastercard,
    cardNumber: 'Master Card ****2',
    image: images.cardImage1,
  },
  {
    id: 2,
    cardName: String.gopay,
    cardNumber: 'Master Card ****2',
    image: images.cardImage2,
  },
  {
    id: 3,
    cardName: String.qris,
    cardNumber: 'Master Card ****2',
    image: images.cardImage3,
  },
  {
    id: 4,
    cardName: String.shopeePay,
    cardNumber: 'Master Card ****2',
    image: images.cardImage4,
  },
  {
    id: 5,
    cardName: String.visa,
    cardNumber: 'Master Card ****2',
    image: images.cardImage5,
  },
];

export const SuggestedLanguages = [
  {
    title: String.suggestedLanguages,
    data: [
      {
        id: 1,
        name: 'English (UK)',
      },
      {
        id: 2,
        name: 'English',
      },
      {
        id: 3,
        name: 'Bahasa Indonesia',
      },
      {
        id: 4,
        name: 'Chinese',
      },
      {
        id: 5,
        name: 'Croatian',
      },
      {
        id: 6,
        name: 'Czech',
      },
      {
        id: 7,
        name: 'Danish',
      },
      {
        id: 8,
        name: 'Filipino',
      },
      {
        id: 9,
        name: 'Finland',
      },
    ],
  },
];

export const OtherLanguages = [
  {
    title: String.otherLanguages,
    data: [
      {
        id: 1,
        name: 'Chinese',
      },
      {
        id: 2,
        name: 'Croatian',
      },
      {
        id: 3,
        name: 'Czech',
      },
      {
        id: 4,
        name: 'Danish',
      },
      {
        id: 5,
        name: 'Filipino',
      },
      {
        id: 6,
        name: 'Finland',
      },
    ],
  },
];

export const HelpAndSupportData = [
  {
    id: 1,
    title: String.helpAndSupportTitle,
    description: String.helpAndSupportDescription,
  },
  {
    id: 2,
    title: String.helpAndSupportTitle,
    description: String.helpAndSupportDescription,
  },
  {
    id: 3,
    title: String.helpAndSupportTitle,
    description: String.helpAndSupportDescription,
  },
  {
    id: 4,
    title: String.helpAndSupportTitle,
    description: String.helpAndSupportDescription,
  },
  {
    id: 5,
    title: String.helpAndSupportTitle,
    description: String.helpAndSupportDescription,
  },
];

export const ReviewData = [
  {
    id: 1,
    image: images.profileImage1,
    name: 'Alenzo Endera',
    ratingStar: 5,
    reviewText:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
    date: '24 Nov 2022',
  },
  {
    id: 2,
    image: images.profileImage2,
    name: 'Jhone Kenoady',
    ratingStar: 5,
    reviewText:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
    date: '23 Nov 2022',
  },
  {
    id: 3,
    image: images.profileImage6,
    name: 'Alexa Bigford',
    ratingStar: 5,
    reviewText:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
    date: '22 Nov 2022',
  },
  {
    id: 4,
    image: images.profileImage7,
    name: 'Jane Liana',
    ratingStar: 5,
    reviewText:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
    date: '22 Nov 2022',
  },
];

export const LegalAndPoliciesData = [
  {
    id: 1,
    title: String.terms,
    description: String.legalPoliciesDescription,
    description1: String.legalPoliciesDescription,
  },
  {
    id: 2,
    title: String.policiesTerms,
    description: String.legalPoliciesDescription,
    description1: String.legalPoliciesDescription,
  },
];

export const NotificationsData = [
  {
    id: 1,
    title: String.payment,
  },
  {
    id: 2,
    title: String.newBook,
  },
  {
    id: 3,
    title: String.message,
  },
  {
    id: 4,
    title: String.updateChapter,
  },
];
