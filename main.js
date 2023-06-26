//pm2 start ./pm2-config.json
//pm2 logs 0

/*

	순서
	
	1. setting
	2. DB
	3. 페이지 렌더링
	4. register.ejs 사용
	5. login.ejs 사용
	6. headnavbar.ejs 사용
	7. customerInfo.ejs 사용

*/

/////////////////////////////////// 1. setting 시작 ///////////////////////////////////

const PORT = 3000;

const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/img', express.static(path.join(__dirname, '/img')));
app.use('/js', express.static(path.join(__dirname, '/js')));

app.listen(PORT, '0.0.0.0', () => {
	console.log(`server started on PORT ${PORT} // ${new Date()}`);
});

const bodyParser = require('body-parser') 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    limit: '150mb',
    extended: true
}))

let sessionID = "";

// 비밀번호 암호화 모듈
const bcrypt = require('bcrypt');
const saltRounds = 10;

// npm install express-session
const requestIp = require('request-ip');

// session 설정
// npm install express-session memorystore
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

app.use(session({
    secret: 'my key',
    resave: false, 
    saveUninitialized: true,
    // store: new MemoryStore({
    //     checkPeriod: 7200000 // 2시간마다 만료된 세션 제거
    // })
}));

/////////////////////////////////// 1. setting 종료 ///////////////////////////////////

/////////////////////////////////// 2. DB 시작 ///////////////////////////////////

const mysql2 = require("mysql2/promise");
const { pool } = require('./password.js');

async function _getConn() {
	try {
		const connection = await pool.getConnection();
		return connection;
	} catch (error) {
		console.error(error);
	}
}

async function asyncQuery(sql, params = []) {
	const conn = await _getConn();

	try {
		const [rows, _] = await conn.query(sql, params);
		return rows;
	} catch (err) {
		console.log(`!! asyncQuery Error \n::${err}\n[sql]::${sql}\n[Param]::${params}`);
	} finally {
		if (conn) {
			conn.release();
		}
  	}
	return false;
}

/////////////////////////////////// 2. DB 종료 ///////////////////////////////////

/////////////////////////////////// 3. 페이지 렌더링 시작 ///////////////////////////////////

app.get("/", async (req, res) => {
    if (req.session.user) {
        const lastPage = req.get('referer')
        sessionID = req.session.user.id;
		console.log(sessionID + "으로 로그인 중");
		
        return res.send(
            `<script>alert("이미 로그인 되어 있습니다. 로그인 중인 아이디는 ${sessionID} 입니다."); location='${lastPage}'</script>`
        );
    } else {
        res.render("index");
    }
});

app.get("/common/headernavbar", async (req, res) => {
	if (!req.session.user || req.session.user == undefined) {
        res.render('/common/headernavbar');
    } else {
        sessionID = req.session.user.id;
        res.render('/common/headernavbar', {sessionID: sessionID});
    }
});

// 회원가입
app.get('/register', async (req, res) => {
	if (!req.session.user || req.session.user === undefined) {
        res.render('register');
    } else {
        sessionID = req.session.user.id;
        res.render('register', {sessionID: sessionID});
    }	
});

// 거래처정보
app.get('/customerInfo', async (req, res) => {
	let rows = await asyncQuery(`SELECT * 
								 FROM YSY.customerInfo
								`);

	if (!req.session.user || req.session.user === undefined) {
        res.render('customerInfo', {rows: rows});
    } else {
        sessionID = req.session.user.id;
        res.render('customerInfo', {rows: rows, sessionID: sessionID});
    }
});

// 집계표
app.get('/summarySheet', async (req, res) => {
	let rows = await asyncQuery(`
								SELECT id, 
									   date, 
									   money 
								FROM YSY.ledger 
								ORDER BY date
								`);
	let monthly_total = await asyncQuery(`
										SELECT MONTH(date) AS month, 
											   SUM(money) AS total
										FROM YSY.ledger
										GROUP BY month
										ORDER BY MIN(date)
	`);
	
	if (!req.session.user || req.session.user === undefined) {
        res.render('summarySheet', { rows: rows, monthly_total: monthly_total});
    } else {
        sessionID = req.session.user.id;
        res.render('summarySheet', { rows: rows, monthly_total: monthly_total, sessionID: sessionID});
    }
});

/////////////////////////////////// 3. 페이지 렌더링 종료 ///////////////////////////////////

/////////////////////////////////// 4. register.ejs 사용 시작 ///////////////////////////////////

// 회원가입 시 아이디 중복확인
app.post("/id_duplicate", async (req, res, err) => {
    let userID = req.body.userID
    let rows = await asyncQuery(`SELECT * 
								 FROM YSY.members 
								 WHERE userID='${userID}'
								`);
    if (rows != '') {
        res.send("fail");
    } else {
        res.send("ok");
    }
});

// 회원 가입
app.post('/register', async (req, res, err) => {
	
	// 비밀번호 암호화
    let saltRounds = 10; // salt가 높을 수록 암호화가 강력해지지만 속도가 느려진다

	let userID 			= req.body.userID;
	// let password 	= req.body.password;
	let password_bcrypt = bcrypt.hashSync(req.body.password, saltRounds);
	let name 			= req.body.name;
	let birth 			= req.body.birth;
	let zipcode			= req.body.zipcode;
	let address			= req.body.address;
	let number 			= req.body.number;
	let email 			= req.body.email;
	
	let rows = await asyncQuery(`INSERT INTO YSY.members 
									(
										userID, 
										password, 
										name, 
										birth,
										zipcode,
										address, 
										number, 
										email
									)
										VALUES (?,?,?,?,?,?,?,?)`, 
									[
										userID,
										password_bcrypt,
										name,
										birth,
										zipcode,
										address,
										number,
										email
									]);

	if (rows.affectedRows != 0 && rows.errno == undefined) {
	  res.send('ok');
	  console.log("회원가입 완료");
	} else {
	  res.send('fail');
	  console.log("회원가입 실패");
	}
});

/////////////////////////////////// 4. register.ejs 사용 종료 ///////////////////////////////////

/////////////////////////////////// 5. login.ejs 사용 시작 ///////////////////////////////////

// 로그인
app.post("/loginaction", async (req, res, err) => {
    let userIP		= requestIp.getClientIp(req);
    let userID		= req.body.userID;
    let password	= req.body.password;

    let rows = await asyncQuery(`SELECT * 
								 FROM YSY.members 
								 WHERE userID = '${userID}'
								`);
    // 값이 존재하지 않을 경우
    if (rows == null || rows == undefined || rows == '') {
        res.end("fail");
    // 값이 존재할 경우
	} else {
		let hashed = rows[0].password; // 암호화된 비밀번호 출력
		let check_password = bcrypt.compareSync(password, hashed); // true, false로 출력

		// 비밀번호가 일치할때
		if (check_password == true) {
			console.log("ID : " + userID + " - 로그인 성공");

			// 아이디, 비번 체크
			req.session.user = {
				id: userID
			};

			req.session.save(function() {
				res.send("ok");
			});
		// 비밀번호가 틀렸을때
		} else {
			res.send("fail");
		}
	}
});

/////////////////////////////////// 5. login.ejs 사용 종료 ///////////////////////////////////

/////////////////////////////////// 6. headnavbar.ejs 사용 시작 ///////////////////////////////////

// 로그아웃
app.post("/logoutaction", async (req, res, err) => {

    sessionID = req.body.sessionID;
	// 로그인 여부 확인
    if (req.session.user) {
        req.session.destroy(
            function(err) {
                if (err) {
					console.log('로그아웃 실패');
                    res.send("error");
                } else {
					console.log('로그아웃 성공');
                	res.send("ok");
				}   
            })
    } else {
        console.log('로그인 되어 있지 않습니다.');
        res.send("fail");
    }
});

/////////////////////////////////// 6. headnavbar.ejs 사용 종료 ///////////////////////////////////

/////////////////////////////////// 7. customerInfo.ejs 사용 시작 ///////////////////////////////////

// 거래처정보 테이블
app.post('/customerInfo_get', async (req, res) => {
    let rows = await asyncQuery(`SELECT * 
								 FROM YSY.customerInfo
								`);
	res.json(rows);
});

// 정보 상세보기
app.post('/customer_detail', async (req, res) => {
	let check_No = req.body.No;
    let rows = await asyncQuery(`SELECT * 
								 FROM YSY.customerInfo 
								 WHERE No = '${check_No}'
								`);
    if (rows.affectedRows != 0 && rows.errno == undefined) {
	  res.send(rows);
	} else {
	  res.send('fail');
	}
});

// 신규등록
app.post('/customer_add', async (req, res) => {
	let registrationNum 			= req.body.registrationNum;
	let name 						= req.body.name;
	let representative				= req.body.representative;
	let date						= req.body.date;
	let corporateRegistrationNum 	= req.body.corporateRegistrationNum;
	let location					= req.body.location;
	let locationOfHeadOffice		= req.body.locationOfHeadOffice;
	let typeOfBusiness				= req.body.typeOfBusiness;
	let item						= req.body.item;
	let email						= req.body.email;
	let callNum						= req.body.callNum;
	let personInCharge				= req.body.personInCharge;
	let memo						= req.body.memo;

    let rows = await asyncQuery(`INSERT INTO YSY.customerInfo 
									(
									 registrationNum, 
									 name,
									 representative,
									 date,
									 corporateRegistrationNum,
									 location,
									 locationOfHeadOffice,
									 typeOfBusiness,
									 item,
									 email,
									 callNum,
									 personInCharge,
									 memo
									 )
								VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,[
									 registrationNum, 
									 name,
									 representative,
									 date,
									 corporateRegistrationNum,
									 location,
									 locationOfHeadOffice,
									 typeOfBusiness,
									 item,
									 email,
									 callNum,
									 personInCharge,
									 memo
								]);
	if (rows.affectedRows != 0 && rows.errno == undefined) {
	  res.send('ok');
	  console.log("거래처 정보 등록완료");
	} else {
	  res.send('fail');
	  console.log("거래처 정보 등록 실패");
	}
});

// 거래처정보 수정하기
app.post("/customer_modify", async (req, res) => {
	let registrationNum 			= req.body.registrationNum;
	let name 						= req.body.name;
	let representative				= req.body.representative;
	let date						= req.body.date;
	let corporateRegistrationNum 	= req.body.corporateRegistrationNum;
	let location					= req.body.location;
	let locationOfHeadOffice		= req.body.locationOfHeadOffice;
	let typeOfBusiness				= req.body.typeOfBusiness;
	let item						= req.body.item;
	let email						= req.body.email;
	let callNum						= req.body.callNum;
	let personInCharge				= req.body.personInCharge;
	let memo						= req.body.memo;
	let No							= req.body.No;
	console.log(No);
	let rows = await asyncQuery(`UPDATE YSY.customerInfo 
								SET registrationNum = '${registrationNum}',
									name = '${name}',
									representative = '${representative}',
									date = '${date}',
									corporateRegistrationNum = '${corporateRegistrationNum}',
									location = '${location}',
									locationOfHeadOffice = '${locationOfHeadOffice}',
									typeOfBusiness = '${typeOfBusiness}',
									item = '${item}',
									email = '${email}',
									callNum = '${callNum}',
									personInCharge = '${personInCharge}',
									memo = '${memo}'
									WHERE no ='${No}'
								`);
	
	if (rows.affectedRows != 0 && rows.errno == undefined) {
	  res.send('ok');
	  console.log("거래처 정보 수정완료");
	} else {
	  res.send('fail');
	  console.log("거래처 정보 수정 실패");
	}
});

// 체크항목 다중 삭제하기
app.post('/customer_delete', async (req, res) => {
	let check_No = JSON.parse(req.body.No);
	let rows = await asyncQuery(`DELETE FROM YSY.customerInfo
								 WHERE No 
								 IN (${check_No.map(value => `'${value}'`).join(',')})
								`);
	
	if (rows.affectedRows != 0 && rows.errno == undefined) {
	  res.send('ok');
	  console.log("거래처 정보 삭제완료");
	} else {
	  res.send('fail');
	  console.log("거래처 정보 삭제 실패");
	}
});


/////////////////////////////////// 7. customerInfo.ejs 사용 종료 ///////////////////////////////////