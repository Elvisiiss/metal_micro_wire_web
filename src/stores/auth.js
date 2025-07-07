import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    function setUser(userData) {
        user.value = {
            user_name: userData.user_name,
            e_mail: userData.e_mail,
            role_id: userData.role_id,
            token: userData.token,
            avatar_url:userData.avatar_url
        }
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
        isAuthenticated.value = true
    }

    function clearUser() {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    function updateUserAvatar(avatar_url){
        if (this.user) {
            this.user.avatar_url = avatar_url;
        }
    }

    function updateUsername(username){
        if (this.user) {
            this.user.user_name = username;
        }
    }

    function loadUserFromStorage() {
        const userData = localStorage.getItem('user')
        if (userData) {
            user.value = JSON.parse(userData)
            isAuthenticated.value = true
        }
    }

    return {
        user,
        isAuthenticated,
        setUser,
        clearUser,
        loadUserFromStorage,
        updateUserAvatar,
        updateUsername
    }
})
