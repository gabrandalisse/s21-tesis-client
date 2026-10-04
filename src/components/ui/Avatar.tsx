import Avatar from 'boring-avatars'

interface UserAvatarProps {
  name: string
  size?: number
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  colors?: string[]
}

export default function UserAvatar({ 
  name, 
  size = 40, 
  variant = 'beam',
  colors = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']
}: UserAvatarProps) {
  return (
    <Avatar
      size={size}
      name={name}
      variant={variant}
      colors={colors}
    />
  )
}