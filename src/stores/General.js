import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useStore = defineStore("tienda", () => {
  const token = ref("");
  const refreshToken = ref("");

  // Cargar tokens desde localStorage solo cuando sea necesario
  function loadTokens() {
    token.value = localStorage.getItem("token") || "";
    refreshToken.value = localStorage.getItem("refreshToken") || "";
  }

  function set_Token_RefreshToken(Token = "", RefreshToken = "") {
    if (!Token || !RefreshToken) {
      throw new Error("Error: Token o RefreshToken inválidos");
    }

    token.value = Token;
    refreshToken.value = RefreshToken;

    localStorage.setItem("token", Token);
    localStorage.setItem("refreshToken", RefreshToken);
  }

  function clearTokens() {
    token.value = "";
    refreshToken.value = "";
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  // Computed para acceder a los valores sin leer directamente localStorage
  const isAuthenticated = computed(() => !!token.value);

  // Cargar tokens al inicializar el store
  loadTokens();

  return {
    token,
    refreshToken,
    isAuthenticated, // Indica si el usuario tiene sesión activa
    set_Token_RefreshToken,
    clearTokens,
  };
});