import { API } from '@/constants/endpoints';
import { axiosInstance } from './api';

/**
 * Ping "hâm" backend trước khi user thực sự cần nó.
 *
 * BE chạy serverless trên Vercel: lambda ngủ sau một lúc không ai gọi, và
 * request đầu tiên chạm DB phải trả tiền cho cả boot lambda + mở connection.
 * Với app chưa đăng nhập, request đó luôn là /auth/login — nên lần login đầu
 * tiên hay timeout rồi lần hai lại tức thì.
 *
 * Gọi lúc mount màn welcome/login: user còn mất vài giây gõ email + mật khẩu,
 * vừa đúng cửa sổ cold start, nên tới lúc bấm Đăng nhập thì lambda đã ấm.
 *
 * Fire-and-forget có chủ đích: không ai await, mọi lỗi bị nuốt. Đây chỉ là tối
 * ưu hoá — ping hỏng thì login vẫn chạy đúng như trước, chỉ chậm lại. Kể cả khi
 * client tự abort vì timeout, lambda phía server vẫn đã boot xong.
 */
export function warmUpApi() {
  axiosInstance.get(API.health).catch(() => {});
}
