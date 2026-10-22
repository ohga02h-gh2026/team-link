import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')

  const [user, setUser] = useState<any>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    getCurrentUser()
  }, [])

  const handleSubmit = async () => {
    setMessage('処理中...')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(`登録エラー: ${error.message}`)
        return
      }

      setMessage(
        'アカウントを作成しました。確認メールを確認してください。'
      )
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`ログインエラー: ${error.message}`)
      return
    }

    setUser(data.user)
    setMessage('ログイン成功！')
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setMessage('チーム名を入力してください。')
      return
    }

    if (!user) {
      setMessage('ログインしてください。')
      return
    }

    setMessage('チームを作成しています...')

    try {
      // --------------------------------
      // ① teams にチームを作成
      // --------------------------------
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName.trim(),
          created_by: user.id,
        })
        .select('id')
        .single()

      if (teamError) {
        setMessage(
          `チーム作成エラー: ${teamError.message} / code: ${
            teamError.code ?? 'なし'
          }`
        )
        return
      }

      if (!team) {
        setMessage('チームIDを取得できませんでした。')
        return
      }

      // --------------------------------
      // ② team_members に自分を登録
      // --------------------------------
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'coach',
        })

      if (memberError) {
        setMessage(
          `メンバー登録エラー: ${memberError.message} / code: ${
            memberError.code ?? 'なし'
          }`
        )
        return
      }

      // --------------------------------
      // ③ 成功
      // --------------------------------
      setMessage('チームを作成しました！')
      setTeamName('')
    } catch (error) {
      setMessage(
        `予期しないエラー: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()

    setUser(null)
    setMessage('')
  }

  // ========================================
  // ログイン済み
  // ========================================
  if (user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            TEAM LINK
          </h1>

          <p className="mt-2 text-slate-600">
            ようこそ、TEAM LINKへ
          </p>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              ログイン中
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {user.email}
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              チーム名
            </label>

            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3"
              placeholder="例：TEAM LINK 京都"
            />
          </div>

          <button
            onClick={handleCreateTeam}
            className="mt-6 w-full rounded-lg bg-slate-900 p-3 font-medium text-white"
          >
            チームを作成
          </button>

          {message && (
            <p className="mt-4 text-sm text-slate-600">
              {message}
            </p>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 w-full text-sm text-slate-500 underline"
          >
            ログアウト
          </button>
        </div>
      </main>
    )
  }

  // ========================================
  // ログイン前
  // ========================================
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          TEAM LINK
        </h1>

        <p className="mt-2 text-slate-600">
          指導者向けチーム管理
        </p>

        <div className="mt-8">
          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            placeholder="example@email.com"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            パスワード
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
            placeholder="パスワード"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full rounded-lg bg-slate-900 p-3 font-medium text-white"
        >
          {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
        </button>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setMessage('')
          }}
          className="mt-4 w-full text-sm text-slate-600 underline"
        >
          {mode === 'login'
            ? 'アカウントを新規作成する'
            : 'ログイン画面に戻る'}
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-600">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}

export default App