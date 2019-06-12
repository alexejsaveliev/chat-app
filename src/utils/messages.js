const generateMessage = (text, username = 'Admin') => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, locationData) => {
    return {
        username,
        locationLink: `https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}