CREATE DATABASE `YSY` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;


-- YSY.cronTest definition
CREATE TABLE `cronTest` (
  `loginLog` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- YSY.customerInfo definition
CREATE TABLE `customerInfo` (
  `No` int(11) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
  `registrationNum` varchar(100) NOT NULL COMMENT '사업자등록번호',
  `name` varchar(100) NOT NULL COMMENT '법인명(단체명)',
  `representative` varchar(100) NOT NULL COMMENT '대표자',
  `date` date DEFAULT NULL COMMENT '개업연월일',
  `corporateRegistrationNum` varchar(100) DEFAULT NULL COMMENT '법인등록번호',
  `location` varchar(100) DEFAULT NULL COMMENT '사업장소재지',
  `locationOfHeadOffice` varchar(100) DEFAULT NULL COMMENT '본점소재지',
  `typeOfBusiness` varchar(100) DEFAULT NULL COMMENT '업태',
  `item` varchar(100) DEFAULT NULL COMMENT '종목',
  `email` varchar(100) DEFAULT NULL COMMENT '전자우편',
  `callNum` varchar(100) DEFAULT NULL COMMENT '연락처',
  `personInCharge` varchar(100) DEFAULT NULL COMMENT '담당자',
  `memo` varchar(100) DEFAULT NULL COMMENT '메모',
  PRIMARY KEY (`No`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- YSY.ledger definition
CREATE TABLE `ledger` (
  `id` int(11) DEFAULT NULL,
  `date` varchar(50) DEFAULT NULL,
  `money` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- YSY.members definition
CREATE TABLE `members` (
  `No` int(11) NOT NULL AUTO_INCREMENT,
  `userID` varchar(100) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `birth` date DEFAULT NULL,
  `zipcode` varchar(100) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `number` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`No`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;