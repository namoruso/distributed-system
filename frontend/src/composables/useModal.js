import { ref } from 'vue';

export function useModal() {
  const alertState = ref({
    show: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'OK',
    autoClose: 0
  });

  const confirmState = ref({
    show: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'warning',
    loading: false,
    onConfirm: null,
    onCancel: null
  });

  const showAlert = (message, options = {}) => {
    return new Promise((resolve) => {
      alertState.value = {
        show: true,
        title: options.title || '',
        message,
        type: options.type || 'info',
        buttonText: options.buttonText || 'OK',
        autoClose: options.autoClose || 0
      };

      const closeHandler = () => {
        alertState.value.show = false;
        resolve();
      };

      alertState.value.onClose = closeHandler;
    });
  };

  const showConfirm = (message, options = {}) => {
    return new Promise((resolve, reject) => {
      confirmState.value = {
        show: true,
        title: options.title || 'Confirm Action',
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'warning',
        loading: false
      };

      confirmState.value.onConfirm = () => {
        confirmState.value.show = false;
        resolve(true);
      };

      confirmState.value.onCancel = () => {
        confirmState.value.show = false;
        resolve(false);
      };
    });
  };

  const closeAlert = () => {
    alertState.value.show = false;
    if (alertState.value.onClose) {
      alertState.value.onClose();
    }
  };

  const handleConfirm = () => {
    if (confirmState.value.onConfirm) {
      confirmState.value.onConfirm();
    }
  };

  const handleCancel = () => {
    if (confirmState.value.onCancel) {
      confirmState.value.onCancel();
    }
  };

  const setConfirmLoading = (loading) => {
    confirmState.value.loading = loading;
  };

  return {
    alertState,
    showAlert,
    closeAlert,

    confirmState,
    showConfirm,
    handleConfirm,
    handleCancel,
    setConfirmLoading
  };
}
