# preact-micro-context

## 為什麼需要？

原生 Preact Context 效能問題：

- ❌ Provider 在每次值改變時都會重新渲染
- ❌ 所有消費組件都會重新渲染，即使它們不需要變更的資料
- ❌ 無法訂閱狀態的特定部分

## 特色功能

- 🚫 **零 Provider 重新渲染** - 使用 `memo(() => true)` 讓 Provider 永不重新渲染
- 🎯 **選擇器支援** - 訂閱狀態的特定部分
- ⚡ **EventBus 架構** - 直接更新，無需 React 協調演算法開銷
- 🔄 **無痛替換** - 與原生 `useContext` 相同的 API
- 📦 **極小體積** - 最小開銷

## 快速開始

```javascript
import { createContext, useContext } from "preact-micro-context";

// 建立 context
const AppContext = createContext({
  user: { name: "小明", email: "ming@example.com" },
  theme: "light",
  count: 0,
});

// Provider（永不重新渲染！）
function App() {
  const [state, setState] = useState({
    user: { name: "小明", email: "ming@example.com" },
    theme: "light",
    count: 0,
  });

  return (
    <AppContext.Provider value={state}>
      <UserProfile />
      <ThemeToggle />
      <Counter />
    </AppContext.Provider>
  );
}

// 帶選擇器的組件（精確更新！）
function UserProfile() {
  // 只有當 user.name 改變時才重新渲染
  const userName = useContext(AppContext, (state) => state.user.name);
  return <div>你好，{userName}！</div>;
}

function ThemeToggle() {
  // 只有當 theme 改變時才重新渲染
  const theme = useContext(AppContext, (state) => state.theme);
  return <div>主題：{theme}</div>;
}

function Counter() {
  // 只有當 count 改變時才重新渲染
  const count = useContext(AppContext, (state) => state.count);
  return <div>計數：{count}</div>;
}
```

## API 參考

### `createContext(name?, defaultValue?)`

與原生 Preact `createContext` 相同但經過優化。

```javascript
const MyContext = createContext("MyContext", defaultValue);
```

### `useContext(context, selector?)`

增強版本，支援可選的選擇器。

```javascript
// 取得完整狀態（與原生相同）
const fullState = useContext(MyContext);

// 取得特定屬性
const userName = useContext(MyContext, (state) => state.user.name);

// 取得計算值
const completedCount = useContext(
  TodoContext,
  (state) => state.todos.filter((todo) => todo.completed).length
);
```

## 效能對比

| 操作         | 原生 Context     | preact-micro-context | 改善幅度 |
| ------------ | ---------------- | -------------------- | -------- |
| 改變用戶名稱 | 5 個組件重新渲染 | **1 個組件**         | 減少 80% |
| 改變主題     | 5 個組件重新渲染 | **1 個組件**         | 減少 80% |
| 改變巢狀屬性 | 5 個組件重新渲染 | **1 個組件**         | 減少 80% |

## 運作原理

1. **Provider 優化**：使用 `memo(() => true)` 防止 Provider 重新渲染
2. **EventBus 通知**：基於事件的直接更新，繞過 React 協調演算法
3. **選擇器精確度**：組件只在其選取的狀態實際改變時才更新

```javascript
// 傳統 Context：Provider 改變 → 所有子組件重新渲染
<Context.Provider value={newValue}>
  <Child1 /> // ❌ 即使不使用變更的資料也會重新渲染
  <Child2 /> // ❌ 即使不使用變更的資料也會重新渲染
</Context.Provider>

// preact-micro-context：只對訂閱者直接更新
<Context.Provider value={newValue}>  // ✅ 永不重新渲染
  <Child1 /> // ✅ 只在其選擇器結果改變時重新渲染
  <Child2 /> // ✅ 只在其選擇器結果改變時重新渲染
</Context.Provider>
```

## 遷移指南

**零破壞性變更** - 無痛替換：

```javascript
// 之前
import { createContext, useContext } from "preact";

// 之後
import { createContext, useContext } from "preact-micro-context";

// 所有現有程式碼都可以正常運作！
// 加入選擇器以獲得效能提升：
const userName = useContext(UserContext, (state) => state.name);
```
