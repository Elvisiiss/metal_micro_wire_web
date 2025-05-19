import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    function setUser(userData) {
        user.value = {
            id: userData.user_id,
            user_name: userData.user_name,
            email: userData.email,
            role_id: userData.role_id
        }
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function clearUser() {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('user')
    }

    function loadUserFromStorage() {
        const userData = localStorage.getItem('user')
        if (userData) {
            user.value = JSON.parse(userData)
            isAuthenticated.value = true
        }
    }

    function isStudent() {
        return user.value?.powers.includes(1)
    }

    function isTeacher() {
        return user.value?.powers.includes(2)
    }

    function isAdmin() {
        return user.value?.powers.includes(3)
    }

    function redirectBasedOnRole() {
        if (isAdmin()) {
            router.push('/admin')
        } else if (isTeacher()) {
            router.push('/teacher')
        } else if (isStudent()) {
            router.push('/student')
        } else {
            router.push('/login')
        }
    }

    return {
        user,
        isAuthenticated,
        setUser,
        clearUser,
        loadUserFromStorage,
        isStudent,
        isTeacher,
        isAdmin,
        redirectBasedOnRole
    }
})
