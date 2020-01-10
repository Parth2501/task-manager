const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'parthshah2501@gmail.com',
//     from: 'parthshah2501@gmail.com',
//     subject: 'First Mail Through API',
//     text: 'Please work normally'
//     // html: ''
// })

const sendWelcomeEmail = (email,name)=>{

    sgMail.send({
        to: email,
        from: 'parthshah2501@gmail.com',
        subject: 'First Mail Through API',
        text: 'Welcome '+name+',\n You have just signuped'
    })
}

const sendFarewellEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'parthshah2501@gmail.com',
        subject: 'First Mail Through API',
        text: 'Goodbye '+name+',\n this is the last email'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendFarewellEmail
}