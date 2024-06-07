const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GitHubStrategy = require('passport-github').Strategy
const bcrypt = require('bcrypt')
const User = require('../dao/Models/User')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        return done(null, false, { message: 'Email no registrado' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return done(null, false, { message: 'Contraseña incorrecta' })
      }

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

passport.use(new GitHubStrategy(
  {
    clientID: 'Ov23libwnwdj3tDtWiig',
    clientSecret: '0aedf41a925e3a9f458d399afa6cc76d9c8f3d8d',
    callbackURL: 'http://localhost:8080/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        user = new User({
          first_name: profile.displayName || profile.username,
          last_name: '',
          email: profile.emails[0].value,
          age: 0, 
          password: '',
          githubId: profile.id
        })
        await user.save()
      }

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

module.exports = passport
