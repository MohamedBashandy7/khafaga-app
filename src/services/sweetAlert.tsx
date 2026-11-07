import Swal from "sweetalert2"

const tailwindSwal = Swal.mixin({
    customClass: {
        confirmButton:
            "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-2",
        cancelButton: "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    },
    buttonsStyling: false
})

export const draggableAlert = () => {
    Swal.fire({
        title: "Drag me!",
        icon: "success",
        draggable: true
    })
}

export const showError = (message: string, title = "خطأ") => {
    Swal.fire({
        icon: "error",
        title,
        text: message
    })
}

export const showSuccess = (message: string, title = "تم") => {
    Swal.fire({
        icon: "success",
        title,
        text: message
    })
}

export const confirmDelete = async () => {
    const result = await tailwindSwal.fire({
        title: "هل أنت متأكد؟",
        text: "! لن تتمكن من التراجع عن هذا",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "! نعم، احذف",
        cancelButtonText: "لا، إلغاء",
        reverseButtons: true
    })
    if (!result.isConfirmed) {
        await tailwindSwal.fire({
            title: "أُلغي",
            icon: "error"
        })
        return false
    }
    return true
}

export const customConfirm = async (
    title: string,
    text: string,
    confirmText = "نعم",
    cancelText = "إلغاء"
) => {
    const result = await Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: confirmText,
        cancelButtonText: cancelText
    })
    return result.isConfirmed
}
