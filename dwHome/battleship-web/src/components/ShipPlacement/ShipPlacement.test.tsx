import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShipPlacement } from './ShipPlacement'
import type { Ship, ShipType } from '../../types/game'
import { SHIP_SIZES, SHIP_NAMES } from '../../types/game'

// Helper to create a ship
const createShip = (
  type: ShipType,
    positions: [number, number][] = [],
    id?: string
): Ship => ({
    id: id || `${type}-${Date.now()}`,
    type,
    positions,
    hits: 0,
    sunk: false,
    size: SHIP_SIZES[type],
})

describe('ShipPlacement Component', () => {
    const mockOnShipsPlaced = vi.fn()

    beforeEach(() => {
        mockOnShipsPlaced.mockClear()
    })

    describe('renders all 5 ships', () => {
        it('displays all ship types in the inventory', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            const shipTypes: ShipType[] = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']

            
            shipTypes.forEach((type) => {
                expect(screen.getByText(SHIP_NAMES[type])).toBeInTheDocument()
            })
        })

        it('displays ship sizes correctly', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Carrier: 5칸, Battleship: 4칸, etc.
            expect(screen.getByText(/5칸/)).toBeInTheDocument()
            expect(screen.getByText(/4칸/)).toBeInTheDocument()
            // Two ships have 3 cells (cruiser and submarine)
            expect(screen.getAllByText(/3칸/).length).toBe(2)
            expect(screen.getByText(/2칸/)).toBeInTheDocument()
        })

        it('shows placement status indicator for each ship', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // All ships should show as "unplaced" initially
            const unplacedIndicators = screen.getAllByText(/미배치/)
            expect(unplacedIndicators.length).toBe(5)
        })

    })

    describe('ship selection', () => {
        it('allows selecting a ship by clicking', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Click on a ship to select it
            const carrierItem = screen.getByTestId('ship-item-carrier')
            await user.click(carrierItem)

            // Ship should be selected (visual indicator)
            expect(carrierItem).toHaveClass('ring-2')
        })

        it('places selected ship on grid cell click', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select the destroyer (smallest, easiest to place)
            const destroyerItem = screen.getByText(SHIP_NAMES.destroyer)
            await user.click(destroyerItem)
            // Click on a grid cell to place
            const cell = screen.getByTestId('placement-grid-cell-0-0')
            await user.click(cell)

            // Ship should be placed (status changes)
            await waitFor(() => {
                expect(screen.getByText(/배치됨/)).toBeInTheDocument()
            })
        })

        it('shows ship preview when hovering over grid', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select a ship
            const destroyerItem = screen.getByText(SHIP_NAMES.destroyer)
            await user.click(destroyerItem)
            // hover over a cell
            const cell = screen.getByTestId('placement-grid-cell-0-0')
            await user.hover(cell)
            // Preview should be shown (highlighted cells)
            // The cell should have a preview class
            expect(cell.className).toMatch(/bg-blue|highlight/)
        })
    })

    describe('R key rotates ship', () => {
        it('rotates selected ship when R key is pressed', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select a ship
            const cruiserItem = screen.getByText(SHIP_NAMES.cruiser)
            await user.click(cruiserItem)
            // Get initial orientation indicator
            const orientationBefore = screen.getByTestId('orientation-indicator').textContent
            // Press R key
            await user.keyboard('r')
            // Orientation should change
            const orientationAfter = screen.getByTestId('orientation-indicator').textContent
            expect(orientationAfter).not.toBe(orientationBefore)
        })

        it('shows rotated preview on grid', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select a ship
            const battleshipItem = screen.getByText(SHIP_NAMES.battleship)
            await user.click(battleshipItem)
            // Press R to rotate
            await user.keyboard('r')
            // Hover over center cell to see vertical preview
            const cell = screen.getByTestId('placement-grid-cell-4-4')
            await user.hover(cell)
            // Vertical preview should show (check if cell below is also highlighted)
            const cellBelow = screen.getByTestId('placement-grid-cell-5-4')
            expect(cellBelow.className).toMatch(/bg-blue|highlight/)
        })
    })

    describe('rotate button rotates ship', () => {
        it('has a rotate button', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            expect(screen.getByRole('button', { name: /회전|rotate/i })).toBeInTheDocument()
        })

        it('rotates ship when rotate button is clicked', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select a ship
            const cruiserItem = screen.getByText(SHIP_NAMES.cruiser)
            await user.click(cruiserItem)
            // Click rotate button
            const rotateButton = screen.getByRole('button', { name: /회전|rotate/i })
            await user.click(rotateButton)
            // Orientation indicator should show vertical
            expect(screen.getByTestId('orientation-indicator')).toHaveTextContent(/세로|vertical/i)
        })

        it('rotate button is disabled when no ship is selected', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            const rotateButton = screen.getByRole('button', { name: /회전|rotate/i })
            expect(rotateButton).toBeDisabled()
        })
    })

    describe('invalid placement shows error', () => {
        it('shows error when placing ship out of bounds', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Select carrier (5 cells, horizontal)
            const carrierItem = screen.getByText(SHIP_NAMES.carrier)
            await user.click(carrierItem)
            // try to place at right edge (would go out of bounds)
            const cell = screen.getByTestId('placement-grid-cell-0-8')
            await user.click(cell)
            // should show error message
            expect(await screen.findByText(/보드 밖|나갑니다/)).toBeInTheDocument()
        })

        it('shows error when ships overlap', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Place destroyer first (at 0,0)
            const destroyerItem = screen.getByText(SHIP_NAMES.destroyer)
            await user.click(destroyerItem)
            await user.click(screen.getByTestId('placement-grid-cell-0-0'))
            // wait for destroyer to be placed
            await waitFor(() => {
                expect(screen.getByText(/배치됨/)).toBeInTheDocument()
            })

            // try to place another ship overlapping
            const submarineItem = screen.getByText(SHIP_NAMES.submarine)
            await user.click(submarineItem)
            await user.click(screen.getByTestId('placement-grid-cell-0-0'))
            // Should show collision error
            expect(await screen.findByText(/겹칩니다/)).toBeInTheDocument()
        })

        it('shows visual feedback for invalid placement', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // place destroyer first
            const destroyerItem = screen.getByText(SHIP_NAMES.destroyer)
            await user.click(destroyerItem)
            await user.click(screen.getByTestId('placement-grid-cell-0-0'))
            // wait for placement
            await waitFor(() => {
                expect(screen.getByText(/배치됨/)).toBeInTheDocument()
            })

            // select another ship and hover over placed ship area
            const submarineItem = screen.getByText(SHIP_NAMES.submarine)
            await user.click(submarineItem)
            await user.hover(screen.getByTestId('placement-grid-cell-0-0'))
            // preview cells should be highlighted (but cell at 0,1 is already placed)
            const cell = screen.getByTestId('placement-grid-cell-0-1')
            // such cell should have a highlight (valid preview)
            expect(cell.className).toMatch(/bg-blue|highlight/)
        })
    })

    describe('randomize button places all ships', () => {
        it('has a randomize button', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            expect(screen.getByRole('button', { name: /무작위|random|자동/i })).toBeInTheDocument()
        })

        it('places all ships randomly when button is clicked', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            const randomizeButton = screen.getByRole('button', { name: /무작위|random|자동/i })
            await user.click(randomizeButton)
            // all ships should be placed (5 "배치됨" indicators)
            await waitFor(() => {
                const placedIndicators = screen.getAllByText('배치됨')
                expect(placedIndicators.length).toBe(5)
            })
        })

        it('calls onShipsPlaced when all ships are placed', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            const randomizeButton = screen.getByRole('button', { name: /무작위|random|자동/i })
            await user.click(randomizeButton)
            await waitFor(() => {
                expect(mockOnShipsPlaced).toHaveBeenCalled()
            })

            // verify all 5 ships are passed
            const calledWithShips = mockOnShipsPlaced.mock.calls[0][0]
            expect(calledWithShips.length).toBe(5)
        })
    })

    describe('clear button removes all ships', () => {
        it('has a clear button', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            expect(screen.getByRole('button', { name: /초기화|clear|전체 삭제/i })).toBeInTheDocument()
        })

        it('removes all ships when clear button is clicked', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // First place some ships
            const randomizeButton = screen.getByRole('button', { name: /무작위|random|자동/i })
            await user.click(randomizeButton)
            await waitFor(() => {
                const placedIndicators = screen.getAllByText('배치됨')
                expect(placedIndicators.length).toBe(5)
            })

            // Now clear
            const clearButton = screen.getByRole('button', { name: /초기화|clear|전체 삭제/i })
            await user.click(clearButton)
            // all ships should be unplaced
            await waitFor(() => {
                const unplacedIndicators = screen.getAllByText(/미배치/)
                expect(unplacedIndicators.length).toBe(5)
            })
        })

        it('does not call onShipsPlaced after clearing', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Place and then clear
            const randomizeButton = screen.getByRole('button', { name: /무작위|random|자동/i })
            await user.click(randomizeButton)
            await waitFor(() => {
                expect(mockOnShipsPlaced).toHaveBeenCalled()
            })

            mockOnShipsPlaced.mockClear()
            const clearButton = screen.getByRole('button', { name: /초기화|clear|전체 삭제/i })
            await user.click(clearButton)
            // should NOT call onShipsPlaced after clear (0 ships placed)
            expect(mockOnShipsPlaced).not.toHaveBeenCalled()
        })
    })

    describe('shows completion status', () => {
        it('displays X/5 ships placed counter', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            expect(screen.getByText(/0\s*\/\s*5/)).toBeInTheDocument()
        })

        it('updates counter as ships are placed', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // place one ship
            const destroyerItem = screen.getByText(SHIP_NAMES.destroyer)
            await user.click(destroyerItem)
            await user.click(screen.getByTestId('placement-grid-cell-0-0'))
            await waitFor(() => {
                expect(screen.getByText(/1\s*\/\s*5/)).toBeInTheDocument()
            })

            // place another
            const submarineItem = screen.getByText(SHIP_NAMES.submarine)
            await user.click(submarineItem)
            await user.click(screen.getByTestId('placement-grid-cell-2-0'))
            await waitFor(() => {
                expect(screen.getByText(/2\s*\/\s*5/)).toBeInTheDocument()
            })
        })

        it('shows completion message when all 5 ships are placed', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            const randomizeButton = screen.getByRole('button', { name: /무작위|random|자동/i })
            await user.click(randomizeButton)
            await waitFor(() => {
                expect(screen.getByText(/완료/)).toBeInTheDocument()
            })
        })
    })

    describe('initialShips prop', () => {
        it('loads initial ships when provided', () => {
            const initialShips: Ship[] = [
                createShip('destroyer', [[0, 0], [0, 1]], 'destroyer-1'),
            ]

            render(
                <ShipPlacement 
                    onShipsPlaced={mockOnShipsPlaced} 
                    initialShips={initialShips}
                />
            )

            // should show 1 ship placed
            expect(screen.getByText(/1\s*\/\s*5/)).toBeInTheDocument()
        })
    })

    describe('disabled prop', () => {
        it('disables all interactions when disabled', () => {
            render(
                <ShipPlacement 
                    onShipsPlaced={mockOnShipsPlaced} 
                    disabled={true}
                />
            )

            // buttons should be disabled
            expect(screen.getByRole('button', { name: /무작위|random|자동/i })).toBeDisabled()
            expect(screen.getByRole('button', { name: /초기화|clear|전체 삭제/i })).toBeDisabled()
            expect(screen.getByRole('button', { name: /회전|rotate/i })).toBeDisabled()
        })
    })

    describe('accessibility', () => {
        it('has proper ARIA labels', () => {
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            expect(screen.getByRole('region', { name: /함선 배치|ship placement/i })).toBeInTheDocument()
        })

        it('supports keyboard navigation for ships', async () => {
            const user = userEvent.setup()
            render(<ShipPlacement onShipsPlaced={mockOnShipsPlaced} />)

            // Tab to first ship
            await user.tab()
            // should focus on a ship item
            const focusedElement = document.activeElement
            expect(focusedElement?.getAttribute('data-testid')).toMatch(/ship-item/)
        })
    })
})
