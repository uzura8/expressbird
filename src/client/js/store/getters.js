export default {
  checkUserType: state => (type) => {
    if (!state.auth.state) return false
    if (state.auth.user == null) return false
    return state.auth.user.type == type
  },

  isEmailVerified: state => () => {
    if (!state.auth.state) return false
    return state.auth.user.emailVerified === true
  },

  example: state => (exampleId) => {
    return state.example.list.find(item => {
      return item.id === exampleId
    })
  },
}
